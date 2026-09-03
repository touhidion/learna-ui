import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Lesson" };

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  return (
    <Placeholder
      title="Lesson"
      features="LC2-LC6, LC8"
      description={`Markdown content, video embed, attachments, mark-complete and prev/next for lesson ${lessonId}.`}
      backHref={`/learn/${courseId}`}
      backLabel="Back to course"
    />
  );
}
