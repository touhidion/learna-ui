"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Users,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { isSuperAdmin } from "@/types/user";
import { cn, initials } from "@/lib/utils";

/**
 * Avatar dropdown in the top-right — the account menu.
 * Tailored distinctively for Super Admins (Management) vs Learners.
 */
export function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const isSuper = isSuperAdmin(user?.role);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  // Management items for Super Admin / Admin; Learner items for students
  const items = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Management Console", icon: LayoutDashboard },
        { href: "/admin/courses", label: "Course Management", icon: BookOpen },
        { href: "/admin/users", label: "User Directory & Roles", icon: Users },
        { href: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
        { href: "/profile", label: "Account Profile", icon: UserIcon },
      ]
    : [
        { href: "/dashboard", label: "My Courses", icon: BookOpen },
        { href: "/certificates", label: "Certificates", icon: Award },
        { href: "/profile", label: "Profile & Settings", icon: UserIcon },
      ];

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${user.name}`}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
          isAdmin
            ? "bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
            : "bg-primary text-xs text-primary-foreground",
          "transition-all hover:scale-105",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        )}
      >
        {user.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.avatar_url} alt="" className="size-9 object-cover" />
        ) : (
          initials(user.name)
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl backdrop-blur-md"
        >
          <div className="border-b border-border/70 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold">{user.name}</p>
              {isSuper ? (
                <span className="rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  Super Admin
                </span>
              ) : isAdmin ? (
                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Admin
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="py-1.5">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-border/70 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}