"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, Skeleton, StatusBadge } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useSetCourseStatus,
  useUpdateCourse,
} from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { isApiError } from "@/lib/api";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import type { Course } from "@/types/course";

const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  description: z.string().max(10000).optional(),
  category: z.string().max(100).optional(),
});

type CourseValues = z.infer<typeof courseSchema>;

/** Admin course list — features AC1, AC4, AC5. */
export function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const { data, isLoading } = useCourses({
    search: debounced || undefined,
    status: status || undefined,
    page,
    page_size: 20,
  });

  const [deleting, setDeleting] = useState<Course | null>(null);
  const deleteCourse = useDeleteCourse();
  const setCourseStatus = useSetCourseStatus();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Only published courses appear in the public catalog.
          </p>
        </div>
        <Link href="/admin/courses/new" className={cn(buttonVariants())}>
          <Plus aria-hidden="true" />
          New course
        </Link>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses"
            aria-label="Search courses"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className="w-44"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.length === 0 ? (
              <TableEmpty colSpan={7}>
                <EmptyState
                  title="No courses yet"
                  description="Create your first course to get started."
                  className="border-0"
                  action={
                    <Link href="/admin/courses/new" className={cn(buttonVariants({ size: "sm" }))}>
                      New course
                    </Link>
                  }
                />
              </TableEmpty>
            ) : (
              data?.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/courses/${c.id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.category || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {c.lesson_count} · {formatDuration(c.duration_min)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.enrollment_count ?? 0}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(c.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {/* AC5. A draft with no lessons is refused by the API,
                          so the button stays enabled and the error explains
                          why rather than the UI silently hiding the action. */}
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={
                          setCourseStatus.isPending && setCourseStatus.variables?.id === c.id
                        }
                        onClick={() =>
                          setCourseStatus.mutate({
                            id: c.id,
                            status: c.status === "published" ? "draft" : "published",
                          })
                        }
                      >
                        {c.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Link
                        href={`/admin/courses/${c.id}/modules`}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        aria-label={`Modules for ${c.title}`}
                      >
                        <Layers aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/admin/courses/${c.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        aria-label={`Edit ${c.title}`}
                      >
                        <Pencil aria-hidden="true" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(c)}
                        aria-label={`Delete ${c.title}`}
                      >
                        <Trash2 className="text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {data && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {data.meta.page} of {data.meta.total_pages} · {data.meta.total_items} courses
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.meta.has_prev}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.meta.has_next}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* AC4 — the cascade is spelled out, because it is not undoable. */}
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        isLoading={deleteCourse.isPending}
        title={`Delete "${deleting?.title}"?`}
        confirmLabel="Delete course"
        description={
          <>
            This also deletes its {deleting?.lesson_count ?? 0} lesson(s), every module,
            all attachments, and the {deleting?.enrollment_count ?? 0} enrollment(s) with
            their progress. It cannot be undone.
          </>
        }
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteCourse.mutateAsync(deleting.id);
            setDeleting(null);
          } catch {
            // Surfaced by the mutation's error toast.
          }
        }}
      />
    </div>
  );
}

/** Create and edit form — features AC2, AC3. */
export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const isEdit = Boolean(course);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      category: course?.category ?? "",
    },
  });

  async function onSubmit(values: CourseValues) {
    try {
      if (course) {
        await updateCourse.mutateAsync({ id: course.id, ...values });
      } else {
        const created = await createCourse.mutateAsync(values);
        // Straight into the module editor: a course with no lessons cannot be
        // published, so that is always the next step.
        router.push(`/admin/courses/${created.id}/modules`);
      }
    } catch (error) {
      if (isApiError(error)) {
        if (error.code === "CONFLICT") {
          setError("title", { message: error.message });
          return;
        }
        for (const f of error.fields) {
          if (f.field in values) {
            setError(f.field as keyof CourseValues, { message: f.message });
          }
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
      <Field
        label="Title"
        htmlFor="title"
        error={errors.title?.message}
        hint={isEdit ? "Changing the title regenerates the public URL." : undefined}
      >
        <Input id="title" hasError={Boolean(errors.title)} {...register("title")} />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea
          id="description"
          rows={5}
          hasError={Boolean(errors.description)}
          {...register("description")}
        />
      </Field>

      <Field
        label="Category"
        htmlFor="category"
        error={errors.category?.message}
        hint="Free text, for example Engineering or Onboarding."
      >
        <Input id="category" hasError={Boolean(errors.category)} {...register("category")} />
      </Field>

      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={createCourse.isPending || updateCourse.isPending}
        >
          {isEdit ? "Save changes" : "Create draft"}
        </Button>
        <Link
          href="/admin/courses"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
