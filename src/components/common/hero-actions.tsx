"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { homeRouteFor } from "@/types/user";

/**
 * Landing-page call to action.
 *
 * A signed-in visitor is never shown "Create an account" — they already have
 * one, and the navbar drops its Sign in / Get started pair for the same
 * reason. Both wait for `isLoading` to clear so the page cannot flash the
 * signed-out CTA before the session is known.
 */
export function HeroActions() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <Link href="/courses" className={cn(buttonVariants({ size: "lg" }))}>
        Browse courses
      </Link>

      {isLoading ? (
        // Same footprint as the button it replaces, so nothing jumps on load.
        <div className="h-11 w-44 animate-pulse rounded-md bg-muted" aria-hidden="true" />
      ) : isAuthenticated ? (
        <Link
          href={homeRouteFor(user?.role)}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Go to dashboard
        </Link>
      ) : (
        <Link
          href="/signup"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Create an account
        </Link>
      )}
    </div>
  );
}
