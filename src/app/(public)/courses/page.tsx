import type { Metadata } from "next";

import { Catalog } from "@/components/course/catalog";
import { API_BASE } from "@/lib/env";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse every published course and enrol for free.",
};

// Categories are stable and public, so they are fetched on the server and
// passed down — the client then only pages through courses.
async function getCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const body = (await res.json()) as { categories: string[] };
    return body.categories ?? [];
  } catch {
    // The catalog still works without the filter if the API is unreachable.
    return [];
  }
}

export default async function CatalogPage() {
  return <Catalog categories={await getCategories()} />;
}
