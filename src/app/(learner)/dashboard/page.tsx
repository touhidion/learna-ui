"use client";

import Link from "next/link";
import { Award, BookOpen } from "lucide-react";

import { CourseCard, CourseCardSkeleton, CourseGrid } from "@/components/course/course-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { useMyEnrollments } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

/** Learner dashboard — features LD1, LD2. */
export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useMyEnrollments();
  const enrollments = data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
        </div>
        <Link href="/certificates" className={cn(buttonVariants({ variant: "outline" }))}>
          <Award aria-hidden="true" />
          Certificates
        </Link>
      </header>

      {isLoading ? (
        <CourseGrid>
          {Array.from({ length: 3 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </CourseGrid>
      ) : enrollments.length === 0 ? (
        /* LD2 */
        <EmptyState
          icon={<BookOpen />}
          title="You are not enrolled in any courses yet"
          description="Browse the catalog and enrol to start learning."
          action={
            <Link href="/courses" className={cn(buttonVariants())}>
              Browse courses
            </Link>
          }
        />
      ) : (
        /* LD1 — Continue goes straight into the player, which opens the first
           lesson when none is specified. */
        <CourseGrid>
          {enrollments.map((e) => (
            <CourseCard
              key={e.id}
              course={e.course}
              href={`/learn/${e.course.id}`}
              progress={e.progress.percentage}
            />
          ))}
        </CourseGrid>
      )}
    </div>
  );
}
