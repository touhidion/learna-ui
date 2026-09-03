"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { homeRouteFor } from "@/types/user";

/**
 * Client-side route guard for the learner and admin areas.
 *
 * The API is the real boundary — every protected endpoint checks the token and
 * the role regardless of what the UI does. This only stops a signed-out
 * visitor from staring at an empty dashboard, so it lives on the client, where
 * the token in localStorage is actually readable.
 *
 * Returns `isReady`, which is false until the session is known. Render a
 * skeleton on false: rendering the page early would flash protected chrome
 * before the redirect lands.
 */
export function useRequireAuth({ adminOnly = false }: { adminOnly?: boolean } = {}) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Preserve the destination so login can return the user to it.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.replace(homeRouteFor(user?.role));
    }
  }, [isLoading, isAuthenticated, isAdmin, adminOnly, pathname, router, user?.role]);

  const isReady = !isLoading && isAuthenticated && (!adminOnly || isAdmin);

  return { user, isReady, isLoading };
}

/**
 * The inverse guard, for /login and /signup: an already-signed-in visitor is
 * sent to their dashboard rather than shown a login form.
 */
export function useRedirectIfAuthenticated() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace(homeRouteFor(user?.role));
  }, [isLoading, isAuthenticated, router, user?.role]);

  return { isLoading, isAuthenticated };
}
