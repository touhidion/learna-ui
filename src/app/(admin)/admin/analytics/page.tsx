"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/ui/feedback";
import { useAnalyticsOverview } from "@/hooks/use-api";

/** Portal-wide analytics — feature AN1. */
export default function Page() {
  const { data, isLoading } = useAnalyticsOverview();

  if (isLoading) return <PageSpinner label="Loading analytics" />;
  if (!data) return <p className="text-sm text-muted-foreground">No analytics available.</p>;

  const groups = [
    {
      heading: "People",
      cards: [
        { label: "Total users", value: data.total_users },
        { label: "Learners", value: data.total_learners },
        { label: "Admins", value: data.total_admins },
      ],
    },
    {
      heading: "Courses",
      cards: [
        { label: "Total", value: data.total_courses },
        { label: "Published", value: data.published_courses },
        { label: "Draft", value: data.draft_courses },
        { label: "Archived", value: data.archived_courses },
      ],
    },
    {
      heading: "Engagement",
      cards: [
        { label: "Enrollments", value: data.total_enrollments },
        { label: "Completions", value: data.total_completions },
        {
          label: "Completion rate",
          // A portal with no enrollments reports 0%, not NaN.
          value:
            data.total_enrollments > 0
              ? `${Math.round((data.total_completions / data.total_enrollments) * 100)}%`
              : "0%",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Portal-wide totals.</p>
      </header>

      {groups.map((g) => (
        <section key={g.heading} className="space-y-3">
          <h2 className="text-lg font-semibold">{g.heading}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {g.cards.map((c) => (
              <Card key={c.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {c.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">{c.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
