/**
 * Shapes shared with learna-api. These mirror `internal/dto/response` — when
 * a payload changes on the API side, it changes here.
 */

/** Stable, branchable error codes from the API's `utils.ErrorCode`. */
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "TOO_MANY_REQUESTS"
  | "PAYLOAD_TOO_LARGE"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NOT_IMPLEMENTED";

export interface ApiFieldError {
  field: string;
  message: string;
}

/** The API's error envelope: `{ "error": { code, message, fields? } }`. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: ApiFieldError[];
  };
}

export interface PageMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** The envelope every list endpoint returns. */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export interface MessageResponse {
  message: string;
}
