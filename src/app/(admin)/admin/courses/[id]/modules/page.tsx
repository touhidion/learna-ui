import { ModulesEditor } from "@/components/admin/modules-editor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ModulesEditor courseId={id} />;
}
