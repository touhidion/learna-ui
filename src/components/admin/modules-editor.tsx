"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import {
  useCourse,
  useCreateLesson,
  useCreateModule,
  useDeleteLesson,
  useDeleteModule,
  useModules,
  useReorderModules,
  useUpdateLesson,
  useUpdateModule,
} from "@/hooks/use-api";
import { cn, formatDuration } from "@/lib/utils";
import type { Lesson, Module } from "@/types/course";

/**
 * Module and lesson editor — features AM1..AM5.
 *
 * Reordering uses explicit up/down controls rather than drag and drop (AM6).
 * They are keyboard accessible and work on touch without a drag sensor; the
 * @dnd-kit version can layer on top, since both drive the same reorder
 * endpoint which requires the complete ordered list either way.
 */
export function ModulesEditor({ courseId }: { courseId: string }) {
  const { data: course } = useCourse(courseId);
  const { data, isLoading } = useModules(courseId);
  const modules = data?.modules ?? [];

  const [creatingModule, setCreatingModule] = useState(false);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/courses"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Courses
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {course?.title ?? "Course"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {modules.length} module(s) · {course?.lesson_count ?? 0} lesson(s)
            {course && ` · ${formatDuration(course.duration_min)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/courses/${courseId}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Course settings
          </Link>
          <Button onClick={() => setCreatingModule(true)}>
            <Plus aria-hidden="true" />
            Add module
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No modules yet"
          description="A course needs at least one lesson before it can be published."
          action={<Button onClick={() => setCreatingModule(true)}>Add the first module</Button>}
        />
      ) : (
        <ol className="space-y-3">
          {modules.map((m, i) => (
            <ModuleCard
              key={m.id}
              courseId={courseId}
              module={m}
              index={i}
              total={modules.length}
              allModules={modules}
            />
          ))}
        </ol>
      )}

      <ModuleDialog
        courseId={courseId}
        open={creatingModule}
        onClose={() => setCreatingModule(false)}
      />
    </div>
  );
}

/** AM1, AM4 — one module with its lessons. */
function ModuleCard({
  courseId,
  module,
  index,
  total,
  allModules,
}: {
  courseId: string;
  module: Module;
  index: number;
  total: number;
  allModules: Module[];
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const deleteModule = useDeleteModule(courseId);
  const deleteLesson = useDeleteLesson(courseId);
  const reorder = useReorderModules(courseId);

  // The API requires the complete ordered list, so a move rebuilds the whole
  // array rather than sending a single changed row.
  function move(direction: -1 | 1) {
    const next = [...allModules];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((m, i) => ({ id: m.id, sort_order: i })));
  }

  return (
    <li className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 p-4">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={index === 0 || reorder.isPending}
            onClick={() => move(-1)}
            aria-label={`Move ${module.title} up`}
          >
            <ChevronUp className="size-3" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            disabled={index === total - 1 || reorder.isPending}
            onClick={() => move(1)}
            aria-label={`Move ${module.title} down`}
          >
            <ChevronDown className="size-3" aria-hidden="true" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <span className="font-medium">
            {index + 1}. {module.title}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            {module.lessons.length} lesson(s)
          </span>
          {module.description && (
            <p className="truncate text-sm text-muted-foreground">{module.description}</p>
          )}
        </button>

        <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit module">
          <Pencil aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeleting(true)} aria-label="Delete module">
          <Trash2 className="text-destructive" aria-hidden="true" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 pt-3">
          {module.lessons.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No lessons yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {module.lessons.map((l, li) => (
                <li key={l.id} className="flex items-center gap-2 py-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {li + 1}. {l.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDuration(l.duration_min)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingLesson(l)}
                    aria-label={`Edit ${l.title}`}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingLesson(l)}
                    aria-label={`Delete ${l.title}`}
                  >
                    <Trash2 className="text-destructive" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setAddingLesson(true)}
          >
            <Plus aria-hidden="true" />
            Add lesson
          </Button>
        </div>
      )}

      <ModuleDialog
        courseId={courseId}
        module={module}
        open={editing}
        onClose={() => setEditing(false)}
      />

      <LessonDialog
        courseId={courseId}
        moduleId={module.id}
        open={addingLesson}
        onClose={() => setAddingLesson(false)}
      />

      {editingLesson && (
        <LessonDialog
          courseId={courseId}
          moduleId={module.id}
          lesson={editingLesson}
          open
          onClose={() => setEditingLesson(null)}
        />
      )}

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        isLoading={deleteModule.isPending}
        title={`Delete "${module.title}"?`}
        confirmLabel="Delete module"
        description={`This also deletes its ${module.lessons.length} lesson(s) and their attachments. It cannot be undone.`}
        onConfirm={async () => {
          try {
            await deleteModule.mutateAsync(module.id);
            setDeleting(false);
          } catch {
            // Reported by the mutation's toast.
          }
        }}
      />

      <ConfirmDialog
        open={deletingLesson !== null}
        onClose={() => setDeletingLesson(null)}
        isLoading={deleteLesson.isPending}
        title={`Delete "${deletingLesson?.title}"?`}
        confirmLabel="Delete lesson"
        description="This also removes its attachments and every learner's progress on it."
        onConfirm={async () => {
          if (!deletingLesson) return;
          try {
            await deleteLesson.mutateAsync(deletingLesson.id);
            setDeletingLesson(null);
          } catch {
            // Reported by the mutation's toast.
          }
        }}
      />
    </li>
  );
}

/** AM2 — add or edit a module. */
function ModuleDialog({
  courseId,
  module,
  open,
  onClose,
}: {
  courseId: string;
  module?: Module;
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateModule(courseId);
  const update = useUpdateModule(courseId);
  const [title, setTitle] = useState(module?.title ?? "");
  const [description, setDescription] = useState(module?.description ?? "");

  async function save() {
    try {
      if (module) {
        await update.mutateAsync({ id: module.id, title, description });
      } else {
        await create.mutateAsync({ title, description });
        setTitle("");
        setDescription("");
      }
      onClose();
    } catch {
      // Reported by the mutation's toast.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={module ? "Edit module" : "Add module"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            isLoading={create.isPending || update.isPending}
            disabled={title.trim().length < 2}
          >
            {module ? "Save" : "Add module"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="module-title">
          <Input
            id="module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Getting started"
          />
        </Field>
        <Field label="Description" htmlFor="module-description">
          <Textarea
            id="module-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>
    </Dialog>
  );
}

/** AM5 — lesson editor: title, markdown body, video and duration. */
function LessonDialog({
  courseId,
  moduleId,
  lesson,
  open,
  onClose,
}: {
  courseId: string;
  moduleId: string;
  lesson?: Lesson;
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateLesson(courseId);
  const update = useUpdateLesson(courseId);

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? "");
  const [duration, setDuration] = useState(String(lesson?.duration_min ?? 0));

  async function save() {
    const minutes = Number.parseInt(duration, 10);
    try {
      if (lesson) {
        await update.mutateAsync({
          id: lesson.id,
          title,
          content,
          // An empty box means "no video", which the API stores as NULL.
          video_url: videoUrl.trim() === "" ? null : videoUrl.trim(),
          duration_min: Number.isNaN(minutes) ? 0 : minutes,
        });
      } else {
        await create.mutateAsync({ moduleId, title, content });
        setTitle("");
        setContent("");
      }
      onClose();
    } catch {
      // Reported by the mutation's toast.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={lesson ? "Edit lesson" : "Add lesson"}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            isLoading={create.isPending || update.isPending}
            disabled={title.trim().length < 2}
          >
            {lesson ? "Save lesson" : "Add lesson"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor="lesson-title">
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduction"
          />
        </Field>

        <Field
          label="Content"
          htmlFor="lesson-content"
          hint="Markdown. Stored raw and rendered by the learner view."
        >
          <Textarea
            id="lesson-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-xs"
            placeholder={"# Heading\n\nSome **markdown** content."}
          />
        </Field>

        {lesson && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Video URL"
              htmlFor="lesson-video"
              hint="YouTube or Vimeo. Leave empty for none."
            >
              <Input
                id="lesson-video"
                value={videoUrl ?? ""}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Field>
            <Field label="Duration (minutes)" htmlFor="lesson-duration">
              <Input
                id="lesson-duration"
                type="number"
                min={0}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>
    </Dialog>
  );
}
