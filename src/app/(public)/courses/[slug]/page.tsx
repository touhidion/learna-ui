import type { Metadata } from "next";

import { CoursePreview } from "@/components/course/course-preview";
import { API_BASE, env } from "@/lib/env";
import type { CourseDetail } from "@/types/course";

async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/courses/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as CourseDetail;
  } catch {
    return null;
  }
}

/** Real Open Graph metadata from the course itself — feature UIF3. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course not found" };

  const description =
    course.description.slice(0, 160) ||
    `${course.lesson_count} lessons. Enrol free on ${env.siteName}.`;

  return {
    title: course.title,
    description,
    alternates: { canonical: `${env.siteUrl}/courses/${slug}` },
    openGraph: {
      type: "article",
      title: course.title,
      description,
      url: `${env.siteUrl}/courses/${slug}`,
      images: course.thumbnail_url ? [course.thumbnail_url] : undefined,
    },
  };
}

export default async function CoursePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Next dedupes this with the fetch in generateMetadata, so the course is
  // fetched once per request and the outline ships in the initial HTML.
  return <CoursePreview slug={slug} initialCourse={(await getCourse(slug)) ?? undefined} />;
}
