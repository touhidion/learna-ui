"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Award, BookOpen, GraduationCap, Plus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { useAnalyticsOverview } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

/** Admin dashboard — features AD1, AD2. Totals come from AN1. */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useAnalyticsOverview();

  useEffect(() => {
    document.title = "Admin Dashboard | Learna";
  }, []);

  const stats = [
    { label: "Users", value: data?.total_users, href: "/admin/users", icon: Users },
    { label: "Courses", value: data?.total_courses, href: "/admin/courses", icon: BookOpen },
    { label: "Published", value: data?.published_courses, href: "/admin/courses?status=published", icon: BookOpen },
    { label: "Enrollments", value: data?.total_enrollments, href: "/admin/analytics", icon: GraduationCap },
    { label: "Completions", value: data?.total_completions, href: "/admin/analytics", icon: Award },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Portal overview and quick actions.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href} className="group">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
    </div>
  );
}