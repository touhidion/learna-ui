"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Clock, PlayCircle } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, PageSpinner } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/card";
import { useEnroll, useMyEnrollments, usePublicCourse } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { cn, formatDuration } from "@/lib/utils";
import type { CourseDetail } from "@/types/course";

/**
 * Public course page — features UP3, PC2.
 *
 * The outline is public; lesson bodies are not returned by the API for an
 * unauthenticated caller, so there is nothing here to withhold client-side.
 */
export function CoursePreview({
  slug,
  initialCourse,
}: {
  slug: string;
  /** Fetched on the server so the outline is in the initial HTML for crawlers
   *  (features UP3, UIF3). react-query adopts it as initialData, so there is
   *  no loading flash and no duplicate request on mount. */
  initialCourse?: CourseDetail;
}) {
  const { data: course, isLoading, isError } = usePublicCourse(slug, initialCourse);
  const { isAuthenticated } = useAuth();
  const { data: enrollments } = useMyEnrollments();
  const enroll = useEnroll();
  const router = useRouter();

  if (isLoading) return <PageSpinner label="Loading course" />;
  if (isError || !course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Course not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been unpublished or removed.
        </p>
        <Link href="/courses" className={cn(buttonVariants({ className: "mt-6" }))}>
          Browse courses
        </Link>
      </div>
    );
  }

  const enrollment = enrollments?.items.find((e) => e.course.id === course.id);
  const isEnrolled = Boolean(enrollment);

  async function onEnrol() {
    if (!isAuthenticated) {
      // Preserve the destination so the learner lands back here after login.
      router.push(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    if (!course) return;
    try {
      await enroll.mutateAsync(course.id);
      router.push(`/learn/${course.id}`);
    } catch {
      // Reported by the mutation's toast.
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        {course.category && <Badge variant="secondary">{course.category}</Badge>}
        <h1 className="text-3xl font-bold tracking-tight text-balance">{course.title}</h1>
        {course.description && (
          <p className="text-lg text-muted-foreground text-pretty">{course.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" aria-hidden="true" />
            {course.lesson_count} lesson{course.lesson_count === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {formatDuration(course.duration_min)}
          </span>
          <span>{course.modules.length} module(s)</span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {isEnrolled ? (
            <Link href={`/learn/${course.id}`} className={cn(buttonVariants({ size: "lg" }))}>
              <PlayCircle aria-hidden="true" />
              Continue learning
            </Link>
          ) : (
            <Button size="lg" onClick={onEnrol} isLoading={enroll.isPending}>
              {isAuthenticated ? "Enrol for free" : "Sign in to enrol"}
            </Button>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Course content</h2>
        <div className="space-y-2">
          {course.modules.map((m, i) => (
            <ModuleOutline key={m.id} index={i} title={m.title} description={m.description}
              lessons={m.lessons.map((l) => ({ id: l.id, title: l.title, duration: l.duration_min }))} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** One collapsible module in the outline — feature UP3. */
function ModuleOutline({
  index,
  title,
  description,
  lessons,
}: {
  index: number;
  title: string;
  description: string;
  lessons: { id: string; title: string; duration: number }[];
}) {
  // The first module opens by default, so the page shows real content
  // immediately rather than a wall of collapsed headers.
  const [open, setOpen] = useState(index === 0);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="font-medium">
            {index + 1}. {title}
          </span>
          {description && (
            <span className="block truncate text-sm text-muted-foreground">{description}</span>
          )}
        </span>
        <span className="shrink-0 text-sm text-muted-foreground">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </span>
      </button>

      {open && lessons.length > 0 && (
        <CardContent className="pt-0">
          <ul className="divide-y divide-border border-t border-border">
            {lessons.map((l) => (
              <li key={l.id} className="flex items-center gap-2 py-2.5 text-sm">
                <PlayCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{l.title}</span>
                {l.duration > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDuration(l.duration)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
