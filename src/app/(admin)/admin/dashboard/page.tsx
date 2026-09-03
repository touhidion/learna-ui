"use client";

import Link from "next/link";
import { BookOpen, Plus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { useCourses, useUsers } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

/**
 * Admin dashboard — features AD1, AD2.
 *
 * The totals come from the existing paginated list endpoints, whose meta
 * carries `total_items`. The dedicated analytics endpoints (AN1/AN2) are not
 * built yet, so the enrollment and completion cards are deliberately absent
 * rather than shown as fake zeroes.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: users, isLoading: loadingUsers } = useUsers({ page_size: 1 });
  const { data: courses, isLoading: loadingCourses } = useCourses({ page_size: 1 });
  const { data: published } = useCourses({ status: "published", page_size: 1 });

  const stats = [
    { label: "Users", value: users?.meta.total_items, loading: loadingUsers, href: "/admin/users", icon: Users },
    { label: "Courses", value: courses?.meta.total_items, loading: loadingCourses, href: "/admin/courses", icon: BookOpen },
    { label: "Published", value: published?.meta.total_items, loading: loadingCourses, href: "/admin/courses?status=published", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Portal overview and quick actions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, loading, href, icon: Icon }) => (
          <Link key={label} href={href} className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-semibold">{value ?? 0}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/courses/new" className={cn(buttonVariants())}>
          <Plus aria-hidden="true" />
          New course
        </Link>
        <Link href="/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
          <Users aria-hidden="true" />
          Manage users
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Enrollment and completion metrics arrive with the analytics endpoints (AN1, AN2).
      </p>
    </div>
  );
}
