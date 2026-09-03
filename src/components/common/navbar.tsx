"use client";

import Link from "next/link";
import { GraduationCap, LayoutDashboard, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserMenu } from "@/components/common/user-menu";
import { useAuth } from "@/providers/auth-provider";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Public and authenticated site header — features UP5, UI5.
 */
export function Navbar() {
  const { user, isLoading, isAuthenticated } = useAuth();

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
          {user?.role === "admin" && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 sm:inline-flex">
              <ShieldCheck className="size-3" /> Admin
            </span>
          )}
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
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

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