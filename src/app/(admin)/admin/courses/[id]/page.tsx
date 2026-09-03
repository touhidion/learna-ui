"use client";

import { use } from "react";
import Link from "next/link";

import { CourseForm } from "@/components/admin/courses-page";
import { PageSpinner, StatusBadge } from "@/components/ui/feedback";
import { buttonVariants } from "@/components/ui/button";
import { useCourse } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

/** Edit an existing course — feature AC3. */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // `use` unwraps the params promise inside a client component.
  const { id } = use(params);
  const { data: course, isLoading } = useCourse(id);

  if (isLoading) return <PageSpinner label="Loading course" />;
  if (!course) return <p className="text-sm text-muted-foreground">Course not found.</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
            ← Courses
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
            <StatusBadge status={course.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            /courses/{course.slug} · {course.lesson_count} lesson(s)
          </p>
        </div>
        <Link
          href={`/admin/courses/${id}/modules`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Modules &amp; lessons
        </Link>
      </header>

      <CourseForm course={course} />
    </div>
  );
}
