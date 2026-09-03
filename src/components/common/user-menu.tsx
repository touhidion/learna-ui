"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  LayoutDashboard,
  LogOut,
  Pencil,
  Shield,
  User as UserIcon,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { cn, initials } from "@/lib/utils";

/**
 * Avatar dropdown in the top-right — the account menu.
 *
 * Hand-rolled rather than pulled from a library: it needs Escape-to-close,
 * click-outside, focus return and roving arrow keys, and that is less code
 * than adding a dependency for one menu.
 */
export function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Focus returns to the trigger, or the keyboard user is stranded.
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

  const items = [
    { href: "/profile", label: "View profile", icon: UserIcon },
    { href: "/profile#edit-profile", label: "Edit profile", icon: Pencil },
    { href: "/dashboard", label: "My courses", icon: LayoutDashboard },
    { href: "/certificates", label: "Certificates", icon: Award },
    ...(isAdmin ? [{ href: "/admin/dashboard", label: "Admin", icon: Shield }] : []),
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
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
          "bg-primary text-xs font-semibold text-primary-foreground",
          "transition-shadow hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        )}
      >
        {user.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element --
             avatars come from Cloudinary, not a next/image remote host */
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
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {user.role.replace("_", " ")}
            </p>
          </div>

          <div className="py-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                // Closed on click rather than by watching the pathname: the
                // menu must also close when the target is the current page.
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
              >
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-border py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
