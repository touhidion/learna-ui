import { CourseForm } from "@/components/admin/courses-page";

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">New course</h1>
        <p className="text-sm text-muted-foreground">
          Saved as a draft. You add modules and lessons next, then publish.
        </p>
      </header>
      <CourseForm />
    </div>
  );
}
