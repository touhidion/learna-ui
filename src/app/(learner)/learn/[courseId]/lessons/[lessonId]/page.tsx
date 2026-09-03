"use client";

import { use } from "react";

import { CoursePlayer } from "@/components/course/course-player";

export default function Page({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  return <CoursePlayer courseId={courseId} lessonId={lessonId} />;
}
