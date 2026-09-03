/**
 * The single HTTP client for learna-api.
 *
 * Two interceptors do the work: one attaches the access token, the other
 * catches a 401 and transparently refreshes. Everything else in the app calls
 * `api.get` / `api.post` and never thinks about tokens.
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE } from "@/lib/env";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth-storage";
import type { ApiErrorBody, ApiErrorCode, ApiFieldError } from "@/types/api";
import type { TokenPair } from "@/types/user";

/** Endpoints that must never trigger a refresh: a 401 from them is the answer,
 *  not a stale token. Refreshing on /auth/refresh would recurse. */
const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/refresh"];

/** Marks a request that has already been retried once after a refresh. */
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * In-flight refresh, shared by every request that 401s at once.
 *
 * Without this, a dashboard firing five parallel requests on a stale token
 * would send five refreshes — and because the API rotates refresh tokens, four
 * of them would fail and log the user out.
 */
let refreshInFlight: Promise<TokenPair> | null = null;

async function refreshAccessToken(): Promise<TokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // A bare axios call, not `api`: this must skip the interceptors above.
  const { data } = await axios.post<TokenPair>(
    `${API_BASE}/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 15_000 },
  );

  setTokens(data);
  return data;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    const isRefreshable =
      status === 401 &&
      original !== undefined &&
      !original._retried &&
      !AUTH_ENDPOINTS.some((path) => original.url?.includes(path));

    if (!isRefreshable) {
      return Promise.reject(toApiError(error));
    }

    original._retried = true;

    try {
      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
      const tokens = await refreshInFlight;

      original.headers.Authorization = `Bearer ${tokens.access_token}`;
      return api.request(original);
    } catch {
      // The refresh token is gone or revoked: the session is over.
      clearSession();
      redirectToLogin();
      return Promise.reject(toApiError(error));
    }
  },
);

/**
 * Sends the browser to the login page, preserving where it was headed.
 *
 * A plain assignment rather than the Next router: interceptors run outside the
 * React tree, where no router instance is available.
 */
function redirectToLogin(): void {
  if (typeof window === "undefined") return;

  const { pathname, search } = window.location;
  if (pathname.startsWith("/login")) return;

  const next = encodeURIComponent(`${pathname}${search}`);
  // The lint rule points at useRouter().push, but this runs inside an axios
  // interceptor: there is no React tree here to read a router from. A full
  // navigation is also the safer outcome, since it discards any client state
  // built up under the now-dead session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=${next}`);
}

/**
 * A failed request, normalised.
 *
 * Every call site can rely on `.code`, `.message` and `.fields` regardless of
 * whether the failure was an API error envelope, a network drop or a timeout.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields: ApiFieldError[];

  constructor(
    message: string,
    code: ApiErrorCode,
    status: number,
    fields: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  /** True when the API rejected specific fields, so a form can mark them. */
  get isValidation(): boolean {
    return this.code === "VALIDATION_ERROR" && this.fields.length > 0;
  }

  /** True for a feature that is registered but not yet built. */
  get isNotImplemented(): boolean {
    return this.code === "NOT_IMPLEMENTED";
  }
}

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const envelope = error.response?.data?.error;
  if (envelope) {
    return new ApiError(
      envelope.message,
      envelope.code,
      error.response?.status ?? 500,
      envelope.fields ?? [],
    );
  }

  if (error.code === "ECONNABORTED") {
    return new ApiError("The request timed out. Please try again.", "INTERNAL_ERROR", 0);
  }
  if (!error.response) {
    return new ApiError(
      "Could not reach the server. Check your connection and try again.",
      "SERVICE_UNAVAILABLE",
      0,
    );
  }
  return new ApiError(
    error.message || "Something went wrong.",
    "INTERNAL_ERROR",
    error.response.status,
  );
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Extracts a message safe to show a user, from anything thrown. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

/* --- typed helpers ---------------------------------------------------------
   Thin wrappers that unwrap `response.data`, so callers write
   `const user = await get<User>("/me")` rather than destructuring every time.
   ------------------------------------------------------------------------- */

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.post<T>(url, body, config);
  return data;
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await api.patch<T>(url, body, config);
  return data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.delete<T>(url, config);
  return data;
}

/** Uploads a file to a multipart endpoint, reporting progress 0..100. */
export async function upload<T>(
  url: string,
  file: File,
  fields: Record<string, string> = {},
  onProgress?: (percent: number) => void,
): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  const { data } = await api.post<T>(url, form, {
    // Left unset deliberately: the browser must add the multipart boundary.
    headers: { "Content-Type": undefined },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return data;
}
