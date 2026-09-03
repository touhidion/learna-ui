"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

import { Badge, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { Card } from "@/components/ui/card";
import { CourseCover } from "@/components/course/course-cover";
import { useAuth } from "@/providers/auth-provider";
import { cn, formatDuration, truncate } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * Catalog card — features UP2, LD1.
 *
 * The whole card is one link rather than a card with a nested link, so the
 * entire surface is clickable and screen readers announce a single target.
 *
 * For unauthenticated users clicking on public courses, directs straight to login
 * preserving the return destination so there is no awkward loading flash.
 */
export function CourseCard({
  course,
  href,
  progress,
}: {
  course: Course;
  /** Custom destination if provided. */
  href?: string;
  /** 0..100. Shown only when the viewer is enrolled. */
  progress?: number;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  // If user is unauthenticated and no explicit custom learner href was given,
  // direct immediately to login page with return URL to avoid waiting for internal page.
  const targetHref =
    href ??
    (isLoading || isAuthenticated
      ? `/courses/${course.slug}`
      : `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);

  return (
    <Link href={targetHref} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <CourseCover
            title={course.title}
            id={course.id}
            thumbnailUrl={course.thumbnail_url}
            category={course.category}
          />
          {course.category && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 border border-white/10 bg-slate-900/70 text-xs font-semibold text-white shadow-sm backdrop-blur-md"
            >
              {course.category}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-semibold leading-snug transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {course.description && (
            <p className="flex-1 text-sm text-muted-foreground">
              {truncate(course.description, 120)}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-primary/70" aria-hidden="true" />
              {course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"}
            </span>
            {course.duration_min > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary/70" aria-hidden="true" />
                {formatDuration(course.duration_min)}
              </span>
            )}
          </div>

          {progress !== undefined && (
            <div className="space-y-1.5 pt-2">
              <ProgressBar value={progress} label={`${Math.round(progress)}% complete`} />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

/** Matching skeleton, so a loading grid keeps the same layout — feature UI2. */
export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}

/** Responsive grid used by both the catalog and the dashboard — feature UI5. */
export function CourseGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}