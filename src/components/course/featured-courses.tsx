"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { CourseCard, CourseCardSkeleton, CourseGrid } from "@/components/course/course-card";
import { buttonVariants } from "@/components/ui/button";
import { usePublicCourses } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

/**
 * Featured courses section on the landing page.
 */
export function FeaturedCourses() {
  const { data, isLoading } = usePublicCourses({ page_size: 6 });

  if (!isLoading && (!data || data.items.length === 0)) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" /> Featured Catalog
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular Courses</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Handpicked curriculum crafted for practical, job-ready mastery.
          </p>
        </div>

        <Link
          href="/courses"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group gap-1 text-sm font-medium text-foreground",
          )}
        >
          <span>View all courses</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <CourseGrid>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
          : data?.items.map((c) => <CourseCard key={c.id} course={c} />)}
      </CourseGrid>
    </section>
  );
}