"use client";

import { use } from "react";

import { CoursePlayer } from "@/components/course/course-player";

export default function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <CoursePlayer courseId={courseId} />;
}
