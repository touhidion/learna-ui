/** Mirrors `models.Role` in the API. */
export type Role = "super_admin" | "admin" | "learner";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  /** ISO timestamp at which the access token expires. */
  expires_at: string;
  /** Access token lifetime in seconds. */
  expires_in: number;
}

/** What `/auth/login` and `/auth/signup` return. */
export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

/** Admins and super admins share every admin route; only super admins may
 *  change roles or delete accounts. */
export function isAdmin(role: Role | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: Role | undefined): boolean {
  return role === "super_admin";
}

/** Where a user lands after signing in. */
export function homeRouteFor(role: Role | undefined): string {
  return isAdmin(role) ? "/admin/dashboard" : "/dashboard";
}
