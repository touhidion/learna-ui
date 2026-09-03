"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Circle,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { PageSpinner, ProgressBar } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGenerateCertificate,
  useLearnCourse,
  useToggleLessonComplete,
} from "@/hooks/use-api";
import { cn, formatDuration, toEmbedUrl } from "@/lib/utils";
import type { Lesson } from "@/types/course";

/**
 * Learner course view — features LC1..LC8.
 *
 * The whole tree arrives in one request (`/learn/courses/:id`), including each
 * lesson's body and completion flag, so moving between lessons needs no
 * further fetch and the sidebar ticks update from the same cache.
 *
 * Attachments (LC4) are not shown: file upload is out of scope for this phase.
 */
export function CoursePlayer({ courseId, lessonId }: { courseId: string; lessonId?: string }) {
  const { data: course, isLoading } = useLearnCourse(courseId);
  const toggle = useToggleLessonComplete(courseId);
  const generateCert = useGenerateCertificate();
  const router = useRouter();

  // A flat, ordered list is what prev/next navigation needs — it has to cross
  // module boundaries, which a nested structure makes awkward (LC6).
  const flat = useMemo(
    () => course?.modules.flatMap((m) => m.lessons) ?? [],
    [course],
  );

  const current = lessonId ? flat.find((l) => l.id === lessonId) : flat[0];
  const index = current ? flat.findIndex((l) => l.id === current.id) : -1;
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  const completed = flat.filter((l) => l.completed).length;
  const percentage = flat.length > 0 ? (completed / flat.length) * 100 : 0;
  const isFinished = flat.length > 0 && completed === flat.length;

  if (isLoading) return <PageSpinner label="Loading course" />;
  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Course unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You may not be enrolled, or the course was removed.
        </p>
        <Link href="/dashboard" className={cn(buttonVariants({ className: "mt-6" }))}>
          Back to my courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      {/* LC1, LC7 — sidebar with progress and navigation. */}
      <aside className="lg:w-80 lg:shrink-0">
        <div className="space-y-4 lg:sticky lg:top-20">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← My courses
            </Link>
            <h1 className="mt-1 font-semibold leading-snug">{course.title}</h1>
          </div>

          <div className="space-y-1.5">
            <ProgressBar value={percentage} label={`${Math.round(percentage)}% complete`} />
            <p className="text-xs text-muted-foreground">
              {completed} of {flat.length} lessons complete
            </p>
          </div>

          <nav aria-label="Course lessons" className="max-h-[60vh] space-y-3 overflow-y-auto">
            {course.modules.map((m, mi) => (
              <div key={m.id}>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {mi + 1}. {m.title}
                </h2>
                <ul className="space-y-0.5">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${courseId}/lessons/${l.id}`}
                        aria-current={l.id === current?.id ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          l.id === current?.id
                            ? "bg-secondary font-medium text-secondary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {l.completed ? (
                          <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 opacity-40" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1">{l.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {/* LC8 — completion banner and certificate CTA. */}
        {isFinished && (
          <Card className="mb-6 border-success/40 bg-success/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-3">
                <Award className="size-8 text-success" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">Course complete</h2>
                  <p className="text-sm text-muted-foreground">
                    Claim your certificate — it is verifiable by anyone.
                  </p>
                </div>
              </div>
              <Button
                isLoading={generateCert.isPending}
                onClick={async () => {
                  try {
                    await generateCert.mutateAsync(courseId);
                    router.push("/certificates");
                  } catch {
                    // Reported by the mutation's toast.
                  }
                }}
              >
                Get certificate
              </Button>
            </CardContent>
          </Card>
        )}

        {current ? (
          <article className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">{current.title}</h2>

            <LessonVideo lesson={current} />

            {current.content ? (
              <div className="prose-lesson">
                {/* Markdown is rendered without rehype-raw: lesson bodies are
                    author-supplied, and allowing embedded HTML would make an
                    admin account an XSS vector against every learner. */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This lesson has no written content yet.
              </p>
            )}

            {/* LC5 — mark complete. */}
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button
                variant={current.completed ? "outline" : "default"}
                isLoading={toggle.isPending}
                onClick={() =>
                  toggle.mutate({ lessonId: current.id, complete: !current.completed })
                }
              >
                {current.completed ? (
                  <>
                    <Check aria-hidden="true" />
                    Completed — undo
                  </>
                ) : (
                  "Mark as complete"
                )}
              </Button>
              {current.duration_min > 0 && (
                <span className="text-sm text-muted-foreground">
                  About {formatDuration(current.duration_min)}
                </span>
              )}
            </div>

            {/* LC6 — prev/next, crossing module boundaries. */}
            <nav aria-label="Lesson navigation" className="flex justify-between gap-3 pt-2">
              {prev ? (
                <Link
                  href={`/learn/${courseId}/lessons/${prev.id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "max-w-[45%]")}
                >
                  <ChevronLeft aria-hidden="true" />
                  <span className="truncate">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/learn/${courseId}/lessons/${next.id}`}
                  className={cn(buttonVariants({ variant: "outline" }), "max-w-[45%]")}
                >
                  <span className="truncate">{next.title}</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              )}
            </nav>
          </article>
        ) : (
          <p className="text-muted-foreground">This course has no lessons yet.</p>
        )}
      </main>
    </div>
  );
}

/** LC3 — responsive video embed, when the lesson has one. */
function LessonVideo({ lesson }: { lesson: Lesson }) {
  if (!lesson.video_url) return null;

  const embed = toEmbedUrl(lesson.video_url);
  if (!embed) {
    // An unrecognised host is linked rather than dropped into an iframe.
    return (
      <a
        href={lesson.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline underline-offset-2"
      >
        Watch the video for this lesson
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
      <iframe
        src={embed}
        title={`${lesson.title} video`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="size-full"
      />
    </div>
  );
}
