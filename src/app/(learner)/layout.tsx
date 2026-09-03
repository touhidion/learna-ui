"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  User,
} from "lucide-react";

import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PageSpinner } from "@/components/ui/feedback";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const LEARNER_NAV = [
  { href: "/dashboard", label: "My Courses", icon: LayoutDashboard },
  { href: "/courses", label: "Browse Catalog", icon: BookOpen },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/profile", label: "Profile & Settings", icon: User },
] as const;

/**
 * Learner shell: Top Navigation Bar and Sidebar Navigation are ALWAYS visible
 * regardless of content or loading state.
 */
export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth();
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar: Always rendered */}
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row">
        {/* Learner Sidebar: Always rendered */}
        <aside className="border-b border-border/80 bg-background/50 backdrop-blur md:w-64 md:shrink-0 md:border-b-0 md:border-r">
          <div className="sticky top-16 space-y-4 p-4 md:py-8">
            <div className="px-3 pb-2 hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Learner Portal
              </p>
            </div>

            <nav aria-label="Learner" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {LEARNER_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
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

              {user?.role === "admin" && (
                <div className="pt-3 md:mt-3 md:border-t md:border-border/60">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
                  >
                    <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                    <span>Admin Panel</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {isReady ? children : <PageSpinner label="Checking your session" />}
        </main>
      </div>

      <Footer />
    </div>
  );
}