"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/common/navbar";
import { PageSpinner } from "@/components/ui/feedback";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses Management", icon: BookOpen },
  { href: "/admin/users", label: "User Directory", icon: Users },
  { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
] as const;

/**
 * Super Admin shell: Top Navigation Bar and Admin Sidebar are ALWAYS visible
 * regardless of content or loading state.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth({ adminOnly: true });
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar: Always rendered */}
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* Admin Sidebar: Always rendered */}
        <aside className="border-b border-border/80 bg-background/50 backdrop-blur md:w-64 md:shrink-0 md:border-b-0 md:border-r">
          <div className="sticky top-16 space-y-4 p-4 md:py-8">
            <div className="flex items-center gap-2 px-3 pb-2">
              <ShieldCheck className="size-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Administration
              </span>
            </div>

            <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
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

              <div className="pt-3 md:mt-3 md:border-t md:border-border/60">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
                  <span>Learner Portal</span>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Admin Content Area */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {isReady ? children : <PageSpinner label="Checking administrative permissions" />}
        </main>
      </div>
    </div>
  );
}