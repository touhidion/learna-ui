import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

/**
 * Params are a Promise in Next 15+ — awaited, not destructured directly.
 * Once the course API lands, this fetches the course and builds real Open
 * Graph metadata from it (feature UIF3).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function CoursePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Placeholder
      title="Course preview"
      features="UP3, PC2"
      description={`Outline, duration and enrol CTA for "${slug}".`}
      backHref="/courses"
      backLabel="Back to catalog"
    />
  );
}
