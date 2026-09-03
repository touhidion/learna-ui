import { Placeholder } from "@/components/common/placeholder";

export default function AdminDashboardPage() {
  return (
    <Placeholder
      title="Admin dashboard"
      features="AD1, AD2, AN1"
      description="Stats cards for users, courses, enrollments and completion rate, plus quick actions."
      backHref="/admin/courses"
      backLabel="Manage courses"
    />
  );
}
