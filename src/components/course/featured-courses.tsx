"use client";

import Link from "next/link";

import { CourseCard, CourseCardSkeleton, CourseGrid } from "@/components/course/course-card";
import { buttonVariants } from "@/components/ui/button";
import { usePublicCourses } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

/**
 * Featured courses on the landing page — feature UP1.
 *
 * Public, so it renders for signed-out visitors too. The section disappears
 * entirely when nothing is published rather than showing an empty grid on the
 * marketing page.
 */
export function FeaturedCourses() {
  const { data, isLoading } = usePublicCourses({ page_size: 6 });

  if (!isLoading && (!data || data.items.length === 0)) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Featured courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.meta.total_items} course(s) available` : "Loading the catalog"}
          </p>
        </div>
        <Link
          href="/courses"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Browse all
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
