/**
 * Browser-side token storage.
 *
 * The API returns tokens in the response body rather than setting cookies, so
 * they live in localStorage. That is readable by any script on the origin —
 * the mitigation is a short access-token lifetime (15 minutes) plus refresh
 * rotation on the API, so a stolen token has a small window and a stolen
 * refresh token is invalidated by the legitimate client's next refresh.
 *
 * Every access is guarded: localStorage throws outright in some privacy modes,
 * and is simply absent during server rendering.
 */

import type { TokenPair, User } from "@/types/user";

const ACCESS_TOKEN_KEY = "learna.access_token";
const REFRESH_TOKEN_KEY = "learna.refresh_token";
const USER_KEY = "learna.user";

/** Fires when tokens change, so open tabs and the AuthProvider stay in sync. */
export const AUTH_CHANGED_EVENT = "learna:auth-changed";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  if (!canUseStorage()) return;
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage full or blocked: the session simply will not survive a reload.
  }
}

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAccessToken(): string | null {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_TOKEN_KEY);
}

/** Returns the cached user, or null when absent or corrupt. */
export function getStoredUser(): User | null {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    write(USER_KEY, null);
    return null;
  }
}

export function setTokens(tokens: TokenPair): void {
  write(ACCESS_TOKEN_KEY, tokens.access_token);
  write(REFRESH_TOKEN_KEY, tokens.refresh_token);
  notifyAuthChanged();
}

export function setStoredUser(user: User | null): void {
  write(USER_KEY, user ? JSON.stringify(user) : null);
  notifyAuthChanged();
}

/** Persists a full login result in one write, firing a single change event. */
export function setSession(user: User, tokens: TokenPair): void {
  write(ACCESS_TOKEN_KEY, tokens.access_token);
  write(REFRESH_TOKEN_KEY, tokens.refresh_token);
  write(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

export function clearSession(): void {
  write(ACCESS_TOKEN_KEY, null);
  write(REFRESH_TOKEN_KEY, null);
  write(USER_KEY, null);
  notifyAuthChanged();
}

export function hasSession(): boolean {
  return getAccessToken() !== null;
}
