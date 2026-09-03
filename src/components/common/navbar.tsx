"use client";

import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogOut, Shield } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { env } from "@/lib/env";
import { cn, initials } from "@/lib/utils";

/**
 * Public site header — features UP5, UI5.
 *
 * Links are styled with `buttonVariants` rather than wrapped in <Button>: a
 * <button> containing an <a> is invalid HTML and breaks keyboard navigation.
 */
export function Navbar() {
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="size-5 text-primary" aria-hidden="true" />
          <span>{env.siteName}</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/courses"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Courses
          </Link>

          <ThemeToggle />

          {/* Nothing auth-dependent renders until the session is known, so the
              header never flickers from signed-out to signed-in. */}
          {isLoading ? (
            <div
              className="ml-2 size-8 animate-pulse rounded-full bg-muted"
              aria-hidden="true"
            />
          ) : isAuthenticated && user ? (
            <div className="ml-2 flex items-center gap-1">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  <Shield aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                <LayoutDashboard aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                href="/profile"
                title={user.name}
                aria-label={`Profile: ${user.name}`}
                className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              >
                {user.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     avatars come from Cloudinary, which is not configured as a
                     next/image remote host */
                  <img src={user.avatar_url} alt="" className="size-8 object-cover" />
                ) : (
                  initials(user.name)
                )}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => void logout()}
                aria-label="Sign out"
              >
                <LogOut aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
