"use client";

import { useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { CourseCard, CourseCardSkeleton, CourseGrid } from "@/components/course/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/feedback";
import { usePublicCourses } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Public course catalog — features UP2, PC1.
 *
 * Client-rendered because the filters are interactive. The course *detail*
 * page stays server-rendered, which is the page that actually needs to be
 * indexable (UIF3).
 */
export function Catalog({ categories }: { categories: string[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const { data, isLoading } = usePublicCourses({
    search: debounced || undefined,
    category: category || undefined,
    page,
    page_size: 12,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Browse every published course and enrol for free.
        </p>
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
        {categories.length > 0 && (
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="w-56"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </div>

      {isLoading ? (
        <CourseGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </CourseGrid>
      ) : data && data.items.length > 0 ? (
        <>
          <CourseGrid>
            {data.items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </CourseGrid>

          {data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted-foreground">
                Page {data.meta.page} of {data.meta.total_pages}
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
        </>
      ) : (
        <EmptyState
          icon={<BookOpen />}
          title={search || category ? "No courses match" : "No courses published yet"}
          description={
            search || category
              ? "Try a different search or category."
              : "Check back soon — new courses are on the way."
          }
        />
      )}
    </div>
  );
}
