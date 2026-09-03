import { Placeholder } from "@/components/common/placeholder";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Placeholder
      title="Course analytics"
      features="ACA1, AN2"
      description={`Enrollment count, completion rate and per-learner progress for course ${id}.`}
      backHref={`/admin/courses/${id}`}
      backLabel="Back to course"
    />
  );
}
