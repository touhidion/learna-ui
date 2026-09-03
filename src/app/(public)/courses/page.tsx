import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse every published course.",
};

export default function CatalogPage() {
  return (
    <Placeholder
      title="Course catalog"
      features="UP2, PC1"
      description="Search, category filter and a paginated grid of published courses, server-rendered for SEO."
      backHref="/"
      backLabel="Back home"
    />
  );
}
