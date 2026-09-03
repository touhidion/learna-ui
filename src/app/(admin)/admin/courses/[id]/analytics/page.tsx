"use client";

import { use } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner, ProgressBar } from "@/components/ui/feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourseAnalytics } from "@/hooks/use-api";

/** Per-course analytics — features AN2, ACA1. */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useCourseAnalytics(id);

  if (isLoading) return <PageSpinner label="Loading analytics" />;
  if (!data) return <p className="text-sm text-muted-foreground">No analytics available.</p>;

  const { stats, learners } = data;
  const cards = [
    { label: "Enrolled", value: stats.enrollment_count },
    { label: "Completed", value: stats.completion_count },
    { label: "Completion rate", value: `${stats.completion_rate}%` },
    { label: "Average progress", value: `${stats.average_progress}%` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Courses
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{stats.course_title}</h1>
        <p className="text-sm text-muted-foreground">Engagement and learner progress.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Enrolled learners</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-56">Progress</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learners.length === 0 ? (
              <TableEmpty colSpan={4}>Nobody has enrolled yet.</TableEmpty>
            ) : (
              learners.map((l) => (
                <TableRow key={l.user_id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={l.percentage} className="flex-1" />
                      <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                        {Math.round(l.percentage)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.is_completed ? "Completed" : "In progress"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
