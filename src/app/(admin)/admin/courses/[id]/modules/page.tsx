import { Placeholder } from "@/components/common/placeholder";

export default async function CourseModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Placeholder
      title="Modules & lessons"
      features="AM1-AM6, M1-M4, L1-L5"
      description={`Drag-and-drop module and lesson editor for course ${id}, with a markdown editor and attachment uploads.`}
      backHref={`/admin/courses/${id}`}
      backLabel="Back to course"
    />
  );
}
