import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

import { Badge, ProgressBar, Skeleton } from "@/components/ui/feedback";
import { Card } from "@/components/ui/card";
import { cn, formatDuration, truncate } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * Catalog card — features UP2, LD1.
 *
 * The whole card is one link rather than a card with a nested link, so the
 * entire surface is clickable and screen readers announce a single target.
 */
export function CourseCard({
  course,
  href,
  progress,
}: {
  course: Course;
  /** Defaults to the public course page. */
  href?: string;
  /** 0..100. Shown only when the viewer is enrolled. */
  progress?: number;
}) {
  return (
    <Link href={href ?? `/courses/${course.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-primary/50">
        <div className="relative aspect-video w-full bg-muted">
          {course.thumbnail_url ? (
            /* eslint-disable-next-line @next/next/no-img-element --
               thumbnails come from Cloudinary, not a next/image host */
            <img
              src={course.thumbnail_url}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground/40" aria-hidden="true" />
            </div>
          )}
          {course.category && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              {course.category}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {course.title}
          </h3>

          {course.description && (
            <p className="flex-1 text-sm text-muted-foreground">
              {truncate(course.description, 120)}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"}
            </span>
            {course.duration_min > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatDuration(course.duration_min)}
              </span>
            )}
          </div>

          {progress !== undefined && (
            <div className="space-y-1 pt-2">
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
      <div className="space-y-2 p-4">
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
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}
