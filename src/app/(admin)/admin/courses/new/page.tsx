import { Placeholder } from "@/components/common/placeholder";

export default function NewCoursePage() {
  return (
    <Placeholder
      title="New course"
      features="AC2, C1"
      description="Title, description, category and a drag-and-drop thumbnail upload. Saves as a draft."
      backHref="/admin/courses"
      backLabel="Back to courses"
    />
  );
}
