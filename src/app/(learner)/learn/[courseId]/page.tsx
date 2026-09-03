import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Course" };

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <Placeholder
      title="Course view"
      features="LC1, LC7"
      description={`Sidebar navigation and progress for course ${courseId}.`}
      backHref="/dashboard"
      backLabel="Back to my courses"
    />
  );
}
