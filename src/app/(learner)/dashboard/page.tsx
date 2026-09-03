"use client";

import Link from "next/link";
import { BookOpen, User as UserIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

/**
 * Learner dashboard — features LD1, LD2.
 *
 * LD2 (the empty state) is what renders today. LD1 — enrolled courses with
 * progress bars — needs GET /me/enrollments, which is still a 501 stub, so
 * the grid is not built yet rather than faked with placeholder cards.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">Your courses and progress.</p>
      </header>

      <EmptyState
        icon={<BookOpen />}
        title="You are not enrolled in any courses yet"
        description="Browse the catalog and enrol to start learning."
        action={
          <Link href="/courses" className={cn(buttonVariants())}>
            Browse courses
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <h2 className="font-medium">Your account</h2>
            <p className="text-sm text-muted-foreground">
              Update your name or change your password.
            </p>
          </div>
          <Link href="/profile" className={cn(buttonVariants({ variant: "outline" }))}>
            <UserIcon aria-hidden="true" />
            Edit profile
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
