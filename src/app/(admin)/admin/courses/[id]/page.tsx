import { Placeholder } from "@/components/common/placeholder";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Placeholder
      title="Edit course"
      features="AC3-AC5, C3-C5"
      description={`Edit, publish or archive course ${id}.`}
      backHref="/admin/courses"
      backLabel="Back to courses"
    />
  );
}
