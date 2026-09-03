"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, LayoutDashboard, ShieldAlert, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { useAuth } from "@/providers/auth-provider";
import { isAdmin, isSuperAdmin } from "@/types/user";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Public and authenticated site header with proper role-aware management navigation.
 */
export function Navbar() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const hasAdminAccess = isAdmin(user?.role);
  const isSuper = isSuperAdmin(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20">
            <GraduationCap className="size-5" aria-hidden="true" />
          </div>
          <span className="text-lg">{env.siteName}</span>

          {isSuper ? (
            <span className="hidden items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 sm:inline-flex">
              <ShieldAlert className="size-3 text-purple-500" /> Super Admin
            </span>
          ) : hasAdminAccess ? (
            <span className="hidden items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 sm:inline-flex">
              <ShieldCheck className="size-3 text-amber-500" /> Admin
            </span>
          ) : null}
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/courses"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Courses
          </Link>

          <ThemeToggle />

          {isLoading ? (
            <div
              className="ml-2 size-8 animate-pulse rounded-full bg-muted"
              aria-hidden="true"
            />
          ) : isAuthenticated && user ? (
            <div className="ml-2 flex items-center gap-2">
              {/* Role-specific direct panel button */}
              {hasAdminAccess ? (
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-xs font-semibold text-slate-950 shadow-sm shadow-amber-500/20 hover:from-amber-500 hover:to-amber-400",
                  )}
                >
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  <span>Management Panel</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                >
                  <BookOpen className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">My Courses</span>
                </Link>
              )}

              <UserMenu />
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