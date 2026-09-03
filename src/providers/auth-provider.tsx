"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { get, post } from "@/lib/api";
import {
  AUTH_CHANGED_EVENT,
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  setStoredUser,
} from "@/lib/auth-storage";
import { type AuthResult, type Role, type User, homeRouteFor, isAdmin } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  role: Role | undefined;
  /** True until the stored session has been checked — guards must wait on it,
   *  or they redirect a signed-in user away on first paint. */
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  /** Re-reads the profile from the API, after a profile edit. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Starts null on both server and client: reading localStorage during render
  // would produce different HTML on each and break hydration. The stored user
  // is adopted in the effect below.
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getAccessToken()) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Show the cached user immediately, then confirm against the API. The
      // cache can be stale (a role change, a deactivation), so it is a
      // starting point, never the source of truth.
      const cached = getStoredUser();
      if (cached && !cancelled) setUser(cached);

      try {
        const fresh = await get<User>("/me");
        if (cancelled) return;
        setUser(fresh);
        setStoredUser(fresh);
      } catch {
        // A 401 here means refresh already failed in the interceptor; any
        // other failure leaves an unverifiable session. Either way, sign out.
        if (cancelled) return;
        clearSession();
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps this tab in step when another tab signs in or out, and when the
  // interceptor clears a dead session.
  useEffect(() => {
    function sync() {
      if (!getAccessToken()) {
        setUser(null);
        return;
      }
      const stored = getStoredUser();
      if (stored) setUser(stored);
    }

    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await post<AuthResult>("/auth/login", { email, password });
    setSession(result.user, result.tokens);
    setUser(result.user);
    return result.user;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = await post<AuthResult>("/auth/signup", { name, email, password });
    setSession(result.user, result.tokens);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    // Revoke server-side first, but never block the sign-out on it: if the
    // request fails the local session must still be cleared.
    if (refreshToken) {
      try {
        await post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Ignored on purpose.
      }
    }

    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return;
    const fresh = await get<User>("/me");
    setUser(fresh);
    setStoredUser(fresh);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role,
      isLoading,
      isAuthenticated: user !== null,
      isAdmin: isAdmin(user?.role),
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Reads the auth context. Throws outside the provider rather than returning a
 *  silently signed-out state, which would hide the wiring mistake. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

export { homeRouteFor };
