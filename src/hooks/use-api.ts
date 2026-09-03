"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { del, errorMessage, get, patch, post } from "@/lib/api";
import type { MessageResponse, Paginated } from "@/types/api";
import type { Course, CourseDetail, Lesson, Module } from "@/types/course";
import type { User } from "@/types/user";

/**
 * Query keys, centralised.
 *
 * Every key is an array so a mutation can invalidate a whole subtree — for
 * example `["courses"]` clears both the list and every course detail, which is
 * what keeps a rename visible in the table without hand-listing each key.
 */
export const keys = {
  users: (params?: unknown) => ["users", params] as const,
  user: (id: string) => ["users", id] as const,
  courses: (params?: unknown) => ["courses", params] as const,
  course: (id: string) => ["courses", id] as const,
  courseDetail: (id: string) => ["courses", id, "detail"] as const,
  modules: (courseId: string) => ["courses", courseId, "modules"] as const,
  lessons: (moduleId: string) => ["modules", moduleId, "lessons"] as const,
  lesson: (id: string) => ["lessons", id] as const,
  categories: () => ["categories"] as const,
};

/** Builds a query string, dropping empty values so the URL stays clean. */
function qs(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/**
 * Wraps a mutation with a success toast, an error toast and cache
 * invalidation, so no call site has to remember all three (feature UI4).
 */
function useApiMutation<TData, TVars>(
  fn: (vars: TVars) => Promise<TData>,
  {
    successMessage,
    invalidate = [],
    ...options
  }: {
    successMessage?: string | ((data: TData) => string);
    invalidate?: readonly unknown[][];
  } & Omit<UseMutationOptions<TData, unknown, TVars>, "mutationFn"> = {},
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVars>({
    mutationFn: fn,
    ...options,
    // Rest args rather than a fixed arity: react-query has extended these
    // callback signatures across minor versions, and forwarding whatever it
    // passes keeps this wrapper from pinning to one of them.
    onSuccess: (...args) => {
      const [data] = args;
      for (const key of invalidate) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      if (successMessage) {
        toast.success(
          typeof successMessage === "function" ? successMessage(data) : successMessage,
        );
      }
      options.onSuccess?.(...args);
    },
    onError: (...args) => {
      toast.error(errorMessage(args[0]));
      options.onError?.(...args);
    },
  });
}

/* --- users ---------------------------------------------------------------- */

export interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  page_size?: number;
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: keys.users(filters),
    queryFn: () => get<Paginated<User>>(`/admin/users${qs({ ...filters })}`),
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table to a spinner on every keystroke.
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: keys.user(id),
    queryFn: () => get<User>(`/admin/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  return useApiMutation(
    (body: { name: string; email: string; password: string; role: string }) =>
      post<User>("/admin/users", body),
    { successMessage: (u) => `${u.name} created.`, invalidate: [["users"]] },
  );
}

export function useUpdateUser() {
  return useApiMutation(
    ({ id, ...body }: { id: string; name?: string; role?: string; is_active?: boolean }) =>
      patch<User>(`/admin/users/${id}`, body),
    { successMessage: "User updated.", invalidate: [["users"]] },
  );
}

export function useDeleteUser() {
  return useApiMutation((id: string) => del<MessageResponse>(`/admin/users/${id}`), {
    successMessage: "User deleted.",
    invalidate: [["users"]],
  });
}

/* --- courses -------------------------------------------------------------- */

export interface CourseFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: keys.courses(filters),
    queryFn: () => get<Paginated<Course>>(`/admin/courses${qs({ ...filters })}`),
    placeholderData: (prev) => prev,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: keys.course(id),
    queryFn: () => get<Course>(`/admin/courses/${id}`),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: keys.categories(),
    queryFn: () => get<{ categories: string[] }>("/admin/categories"),
  });
}

export function useCreateCourse() {
  return useApiMutation(
    (body: { title: string; description?: string; category?: string }) =>
      post<Course>("/admin/courses", body),
    { successMessage: "Course created as a draft.", invalidate: [["courses"]] },
  );
}

export function useUpdateCourse() {
  return useApiMutation(
    ({ id, ...body }: { id: string; title?: string; description?: string; category?: string }) =>
      patch<Course>(`/admin/courses/${id}`, body),
    { successMessage: "Course saved.", invalidate: [["courses"]] },
  );
}

export function useSetCourseStatus() {
  return useApiMutation(
    ({ id, status }: { id: string; status: string }) =>
      patch<Course>(`/admin/courses/${id}/status`, { status }),
    { successMessage: (c) => `Course ${c.status}.`, invalidate: [["courses"]] },
  );
}

export function useDeleteCourse() {
  return useApiMutation((id: string) => del<MessageResponse>(`/admin/courses/${id}`), {
    successMessage: "Course deleted.",
    invalidate: [["courses"]],
  });
}

/* --- modules -------------------------------------------------------------- */

export function useModules(courseId: string) {
  return useQuery({
    queryKey: keys.modules(courseId),
    queryFn: () => get<{ modules: Module[] }>(`/admin/courses/${courseId}/modules`),
    enabled: Boolean(courseId),
  });
}

export function useCreateModule(courseId: string) {
  return useApiMutation(
    (body: { title: string; description?: string }) =>
      post<Module>(`/admin/courses/${courseId}/modules`, body),
    { successMessage: "Module added.", invalidate: [["courses", courseId, "modules"]] },
  );
}

export function useUpdateModule(courseId: string) {
  return useApiMutation(
    ({ id, ...body }: { id: string; title?: string; description?: string }) =>
      patch<Module>(`/admin/modules/${id}`, body),
    { successMessage: "Module updated.", invalidate: [["courses", courseId, "modules"]] },
  );
}

export function useDeleteModule(courseId: string) {
  return useApiMutation((id: string) => del<MessageResponse>(`/admin/modules/${id}`), {
    successMessage: "Module deleted.",
    invalidate: [["courses", courseId, "modules"]],
  });
}

export function useReorderModules(courseId: string) {
  return useApiMutation(
    (items: { id: string; sort_order: number }[]) =>
      patch<{ modules: Module[] }>(`/admin/courses/${courseId}/modules/reorder`, { items }),
    { successMessage: "Order saved.", invalidate: [["courses", courseId, "modules"]] },
  );
}

/* --- lessons -------------------------------------------------------------- */

export function useLesson(id: string) {
  return useQuery({
    queryKey: keys.lesson(id),
    queryFn: () => get<Lesson>(`/admin/lessons/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateLesson(courseId: string) {
  return useApiMutation(
    ({ moduleId, ...body }: { moduleId: string; title: string; content?: string }) =>
      post<Lesson>(`/admin/modules/${moduleId}/lessons`, body),
    { successMessage: "Lesson added.", invalidate: [["courses", courseId, "modules"]] },
  );
}

export function useUpdateLesson(courseId: string) {
  return useApiMutation(
    ({ id, ...body }: {
      id: string;
      title?: string;
      content?: string;
      video_url?: string | null;
      duration_min?: number;
    }) => patch<Lesson>(`/admin/lessons/${id}`, body),
    {
      successMessage: "Lesson saved.",
      invalidate: [["courses", courseId, "modules"], ["lessons"]],
    },
  );
}

export function useDeleteLesson(courseId: string) {
  return useApiMutation((id: string) => del<MessageResponse>(`/admin/lessons/${id}`), {
    successMessage: "Lesson deleted.",
    invalidate: [["courses", courseId, "modules"]],
  });
}

export function useReorderLessons(courseId: string) {
  return useApiMutation(
    ({ moduleId, items }: { moduleId: string; items: { id: string; sort_order: number }[] }) =>
      patch<{ lessons: Lesson[] }>(`/admin/modules/${moduleId}/lessons/reorder`, { items }),
    { successMessage: "Order saved.", invalidate: [["courses", courseId, "modules"]] },
  );
}

/* --- public --------------------------------------------------------------- */

export function usePublicCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ["public-courses", filters],
    queryFn: () => get<Paginated<Course>>(`/courses${qs({ ...filters })}`),
    placeholderData: (prev) => prev,
  });
}

export function usePublicCourse(slug: string) {
  return useQuery({
    queryKey: ["public-courses", slug],
    queryFn: () => get<CourseDetail>(`/courses/${slug}`),
    enabled: Boolean(slug),
  });
}

/* --- profile -------------------------------------------------------------- */

export function useUpdateProfile() {
  return useApiMutation(
    (body: { name?: string; avatar_url?: string }) => patch<User>("/me", body),
    { successMessage: "Profile updated." },
  );
}

export function useChangePassword() {
  return useApiMutation(
    (body: { current_password: string; new_password: string }) =>
      patch<MessageResponse>("/me/password", body),
    { successMessage: "Password changed. Other sessions were signed out." },
  );
}
