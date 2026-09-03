"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, BookOpen } from "lucide-react";

import { CourseCard, CourseCardSkeleton, CourseGrid } from "@/components/course/course-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, PageSpinner } from "@/components/ui/feedback";
import { useMyEnrollments } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

/** Learner dashboard — features LD1, LD2. Administrators are routed to Management Console. */
export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { data, isLoading } = useMyEnrollments();
  const enrollments = data?.items ?? [];

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin/dashboard");
      return;
    }
    document.title = "My Courses & Dashboard | Learna";
  }, [isAdmin, router]);

  // If administrator landed here, show spinner while redirecting to Management Console
  if (isAdmin) {
    return <PageSpinner label="Redirecting to Management Console..." />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">Pick up right where you left off.</p>
        </div>
        <Link href="/certificates" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          <Award className="size-4 text-amber-500" aria-hidden="true" />
          <span>Certificates</span>
        </Link>
      </header>

      {isLoading ? (
        <CourseGrid>
          {Array.from({ length: 3 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </CourseGrid>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="text-primary" />}
          title="You are not enrolled in any courses yet"
          description="Browse the course catalog and enrol to start learning."
          action={
            <Link href="/courses" className={cn(buttonVariants())}>
              Browse Courses
            </Link>
          }
        />
      ) : (
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