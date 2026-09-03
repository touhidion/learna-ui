"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Eye,
  LayoutDashboard,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/common/navbar";
import { PageSpinner } from "@/components/ui/feedback";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { isSuperAdmin } from "@/types/user";
import { cn } from "@/lib/utils";

const MANAGEMENT_NAV = [
  { href: "/admin/dashboard", label: "Overview & Health", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Course Management", icon: BookOpen },
  { href: "/admin/users", label: "User Directory & Roles", icon: Users },
  { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
] as const;

/**
 * Super Admin Management Shell: Top Navigation Bar and Management Sidebar are ALWAYS visible.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useRequireAuth({ adminOnly: true });
  const pathname = usePathname();
  const isSuper = isSuperAdmin(user?.role);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar: Always rendered */}
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* Management Sidebar: Always rendered */}
        <aside className="border-b border-border/80 bg-background/50 backdrop-blur md:w-64 md:shrink-0 md:border-b-0 md:border-r">
          <div className="sticky top-16 space-y-5 p-4 md:py-8">
            {/* Management Header Badge */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/50 px-3.5 py-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                {isSuper ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {isSuper ? "Super Admin" : "Admin Panel"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">Management Console</p>
              </div>
            </div>

            {/* Core Management Navigation */}
            <nav aria-label="Management" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              <p className="hidden px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 md:block">
                Core Governance
              </p>
              {MANAGEMENT_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
              })}

              {/* Quick Actions */}
              <div className="pt-2 md:mt-3 md:border-t md:border-border/60 md:pt-4">
                <p className="hidden px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 md:block">
                  Quick Actions
                </p>
                <Link
                  href="/admin/courses/new"
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-semibold",
                    pathname === "/admin/courses/new"
                      ? "bg-primary text-primary-foreground"
                      : "text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
                  )}
                >
                  <PlusCircle className="size-4 shrink-0" aria-hidden="true" />
                  <span>Create Course</span>
                </Link>

                <Link
                  href="/courses"
                  className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Eye className="size-4 shrink-0" aria-hidden="true" />
                  <span>View Public Catalog</span>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {isReady ? children : <PageSpinner label="Checking administrative permissions" />}
        </main>
      </div>
    </div>
  );
}