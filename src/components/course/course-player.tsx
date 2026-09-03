"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Circle,
  Clock,
  Sparkles,
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
 * Learner course view — features LC1..LC8 with dedicated distraction-free
 * learning mode header and back navigation.
 */
export function CoursePlayer({ courseId, lessonId }: { courseId: string; lessonId?: string }) {
  const { data: course, isLoading } = useLearnCourse(courseId);
  const toggle = useToggleLessonComplete(courseId);
  const generateCert = useGenerateCertificate();
  const router = useRouter();

  // Update browser title when course loads
  useEffect(() => {
    if (course?.title) {
      document.title = `${course.title} | Learna`;
    }
  }, [course?.title]);

  // Flat ordered list for prev/next navigation
  const flat = useMemo(
    () => course?.modules.flatMap((m) => m.lessons) ?? [],
    [course],
  );

  // Resume at first uncompleted lesson if none specified
  const current = lessonId
    ? flat.find((l) => l.id === lessonId)
    : flat.find((l) => !l.completed) ?? flat[0];

  const index = current ? flat.findIndex((l) => l.id === current.id) : -1;
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  const completed = flat.filter((l) => l.completed).length;
  const percentage = flat.length > 0 ? (completed / flat.length) * 100 : 0;
  const isFinished = flat.length > 0 && completed === flat.length;

  async function handleClaimCertificate() {
    try {
      await generateCert.mutateAsync(courseId);
      router.push("/certificates");
    } catch {
      // Handled by toast
    }
  }

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
    <div className="space-y-6">
      {/* Top Learning Mode Navigation & Progress Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2 font-medium transition-colors hover:border-primary/50",
            )}
          >
            <ArrowLeft className="size-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="hidden h-6 w-px bg-border/80 sm:block" />

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Learning Mode
            </p>
            <h1 className="truncate text-sm font-bold sm:text-base text-foreground">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground">
              {completed} of {flat.length} completed
            </p>
            <p className="text-[11px] text-muted-foreground">{Math.round(percentage)}% progress</p>
          </div>

          <div className="w-24 sm:w-28">
            <ProgressBar value={percentage} />
          </div>

          {isFinished && (
            <Button
              size="sm"
              onClick={handleClaimCertificate}
              isLoading={generateCert.isPending}
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
            >
              <Award className="size-3.5" />
              <span className="hidden sm:inline">Claim Certificate</span>
              <span className="sm:hidden">Certificate</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Learning Workspace: Content + Curriculum Sidebar */}
      <div className="flex w-full flex-col-reverse gap-6 lg:flex-row">
        {/* Main Lesson Content Area */}
        <main className="min-w-0 flex-1">
          {/* Completion Celebration Banner */}
          {isFinished && (
            <Card className="mb-6 overflow-hidden border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20">
                    <Award className="size-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <Sparkles className="size-3.5" /> Course Complete
                    </div>
                    <h2 className="text-base font-bold sm:text-lg">Congratulations! You earned your certificate.</h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Claim your verified credential to share on your resume and LinkedIn.
                    </p>
                  </div>
                </div>
                <Button
                  isLoading={generateCert.isPending}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                  onClick={handleClaimCertificate}
                >
                  Claim Certificate
                </Button>
              </CardContent>
            </Card>
          )}

          {current ? (
            <article className="space-y-6 rounded-2xl border border-border/70 bg-card/40 p-6 sm:p-8">
              <div className="space-y-2 border-b border-border/60 pb-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Lesson {index + 1} of {flat.length}</span>
                  {current.duration_min > 0 && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDuration(current.duration_min)}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                  {current.title}
                </h2>
              </div>

              <LessonVideo lesson={current} />

              {current.content ? (
                <div className="prose-lesson">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{current.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This lesson has no written content yet.
                </p>
              )}

              {/* Mark Complete Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-6">
                <Button
                  variant={current.completed ? "outline" : "default"}
                  isLoading={toggle.isPending}
                  onClick={() =>
                    toggle.mutate({ lessonId: current.id, complete: !current.completed })
                  }
                  className={cn(
                    "gap-2 font-semibold",
                    !current.completed && "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500",
                  )}
                >
                  {current.completed ? (
                    <>
                      <Check className="size-4 text-emerald-500" aria-hidden="true" />
                      <span>Completed — Click to Undo</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" aria-hidden="true" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </Button>

                {current.duration_min > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Estimated duration: {formatDuration(current.duration_min)}
                  </span>
                )}
              </div>

              {/* Prev / Next Lesson Navigation */}
              <nav aria-label="Lesson navigation" className="flex justify-between gap-3 border-t border-border/60 pt-6">
                {prev ? (
                  <Link
                    href={`/learn/${courseId}/lessons/${prev.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "gap-2 max-w-[48%]")}
                  >
                    <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate text-xs sm:text-sm">Previous: {prev.title}</span>
                  </Link>
                ) : (
                  <span />
                )}

                {next ? (
                  <Link
                    href={`/learn/${courseId}/lessons/${next.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "gap-2 max-w-[48%] bg-primary/5 hover:bg-primary/10 border-primary/30",
                    )}
                  >
                    <span className="truncate text-xs sm:text-sm">Next: {next.title}</span>
                    <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                ) : isFinished ? (
                  <Button
                    onClick={handleClaimCertificate}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold"
                  >
                    <Award className="size-4" />
                    <span>View Certificate</span>
                  </Button>
                ) : null}
              </nav>
            </article>
          ) : (
            <p className="text-muted-foreground">This course has no lessons yet.</p>
          )}
        </main>

        {/* Course Curriculum Outline Sidebar */}
        <aside className="lg:w-80 xl:w-96 lg:shrink-0">
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm lg:sticky lg:top-20">
            <div>
              <h2 className="text-sm font-bold text-foreground">Course Curriculum</h2>
              <p className="text-xs text-muted-foreground">
                {course.modules.length} modules • {flat.length} lessons
              </p>
            </div>

            <nav aria-label="Course lessons" className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
              {course.modules.map((m, mi) => (
                <div key={m.id} className="space-y-1">
                  <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {mi + 1}. {m.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${courseId}/lessons/${l.id}`}
                          aria-current={l.id === current?.id ? "page" : undefined}
                          className={cn(
                            "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors",
                            l.id === current?.id
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {l.completed ? (
                            <CircleCheck
                              className={cn(
                                "mt-0.5 size-4 shrink-0",
                                l.id === current?.id ? "text-primary-foreground" : "text-amber-500",
                              )}
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle className="mt-0.5 size-4 shrink-0 opacity-40" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1 leading-relaxed">{l.title}</span>
                          {l.duration_min > 0 && (
                            <span className="shrink-0 text-[10px] opacity-70">
                              {l.duration_min}m
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** LC3 — responsive video embed, when the lesson has one. */
function LessonVideo({ lesson }: { lesson: Lesson }) {
  if (!lesson.video_url) return null;

  const embed = toEmbedUrl(lesson.video_url);
  if (!embed) {
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
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-inner">
      <iframe
        src={embed}
        title={lesson.title}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}