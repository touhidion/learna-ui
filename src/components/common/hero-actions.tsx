"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { homeRouteFor } from "@/types/user";

export function HeroActions() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
      <Link
        href="/courses"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-12 px-6 text-base font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02]",
        )}
      >
        <span>Explore Courses</span>
        <ArrowRight className="ml-1.5 size-4" />
      </Link>

      {isLoading ? (
        <div className="h-12 w-44 animate-pulse rounded-xl bg-muted" aria-hidden="true" />
      ) : isAuthenticated ? (
        <Link
          href={homeRouteFor(user?.role)}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 px-6 text-base font-medium transition-all hover:bg-muted",
          )}
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link
          href="/signup"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 px-6 text-base font-medium transition-all hover:bg-muted",
          )}
        >
          <span>Start Learning Free</span>
        </Link>
      )}
    </div>
  );
}