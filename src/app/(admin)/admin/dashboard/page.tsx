"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { useAnalyticsOverview } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";
import { isSuperAdmin } from "@/types/user";
import { cn } from "@/lib/utils";

/**
 * Super Admin Management Console — comprehensive enterprise control center.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useAnalyticsOverview();
  const isSuper = isSuperAdmin(user?.role);

  useEffect(() => {
    document.title = "Management Console | Learna";
  }, []);

  const kpis = [
    {
      label: "Registered Users",
      value: data?.total_users,
      href: "/admin/users",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Learners and administrative staff",
    },
    {
      label: "Course Catalog",
      value: data?.total_courses,
      href: "/admin/courses",
      icon: BookOpen,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: `${data?.published_courses ?? 0} active & published`,
    },
    {
      label: "Active Enrollments",
      value: data?.total_enrollments,
      href: "/admin/analytics",
      icon: GraduationCap,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Ongoing learner course enrollments",
    },
    {
      label: "Certificates Earned",
      value: data?.total_completions,
      href: "/admin/analytics",
      icon: Award,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Verified course completions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Management Console Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-muted/80 via-background to-background p-6 sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                {isSuper ? <ShieldAlert className="size-3.5 text-purple-500" /> : <ShieldCheck className="size-3.5 text-amber-500" />}
                {isSuper ? "Super Administrator Console" : "Administrator Console"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" /> System Operational
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Management Console
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Centralized platform governance: user directory, role permissions, course authoring, and platform telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/courses/new"
              className={cn(
                buttonVariants(),
                "gap-2 bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500",
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>Create Course</span>
            </Link>
            <Link
              href="/admin/users"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <Users className="size-4" aria-hidden="true" />
              <span>User Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, href, icon: Icon, color, description }) => (
          <Link key={label} href={href} className="group">
            <Card className="h-full border-border/80 transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </CardTitle>
                <div className={cn("flex size-8 items-center justify-center rounded-lg border", color)}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <p className="text-3xl font-black tracking-tight">{value ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Management Pillars Hub */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Platform Management Hub</h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management Hub */}
          <Card className="flex flex-col justify-between border-border/80 transition-all hover:border-border">
            <CardHeader className="space-y-2">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="size-6" />
              </div>
              <CardTitle className="text-lg font-bold">User Management</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Oversee learner profiles, assign administrative roles, manage account activation states, and inspect registered users.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/admin/users"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-between gap-2 text-xs font-semibold",
                )}
              >
                <span>Manage Users & Roles</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Course Catalog Management */}
          <Card className="flex flex-col justify-between border-border/80 transition-all hover:border-border">
            <CardHeader className="space-y-2">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BookOpen className="size-6" />
              </div>
              <CardTitle className="text-lg font-bold">Course Management</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Author new courses, organize modules and lessons, update curriculum markdown content, and publish courses.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/admin/courses"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-between gap-2 text-xs font-semibold",
                )}
              >
                <span>Manage Courses</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Analytics & Performance */}
          <Card className="flex flex-col justify-between border-border/80 transition-all hover:border-border">
            <CardHeader className="space-y-2">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BarChart3 className="size-6" />
              </div>
              <CardTitle className="text-lg font-bold">Analytics & Audits</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Monitor platform completion metrics, enrollment velocity, drop-off rates, and certificate issuance trends.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href="/admin/analytics"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-between gap-2 text-xs font-semibold",
                )}
              >
                <span>View Analytics</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}