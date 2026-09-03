"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/feedback";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

/**
 * Admin shell: a sidebar on desktop, a horizontal scroller on mobile
 * (feature UI5).
 *
 * `adminOnly` sends a signed-in learner to their own dashboard. The API
 * enforces the same rule on every /admin endpoint — this only keeps the UI
 * honest.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth({ adminOnly: true });
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!isReady) {
    return <PageSpinner label="Checking your permissions" />;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-2 px-4 font-semibold">
          <GraduationCap className="size-5 text-primary" aria-hidden="true" />
          <span>{env.siteName}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
            admin
          </span>
        </div>

        <nav
          aria-label="Admin"
          className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible"
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            // startsWith so a nested route keeps its section highlighted.
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end gap-2 border-b border-border px-4">
          <span className="mr-auto truncate text-sm text-muted-foreground">
            {user?.name}
          </span>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Learner view
          </Link>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out">
            <LogOut aria-hidden="true" />
          </Button>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
