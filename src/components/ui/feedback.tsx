import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { CourseStatus } from "@/types/course";

/* --- badge ---------------------------------------------------------------- */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Course status as a colour-coded badge, with the mapping in one place. */
export function StatusBadge({ status }: { status: CourseStatus }) {
  const variant = {
    draft: "secondary",
    published: "success",
    archived: "outline",
  } as const;

  return <Badge variant={variant[status]}>{status}</Badge>;
}

/* --- skeleton ------------------------------------------------------------- */

/**
 * A loading placeholder — feature UI2.
 *
 * `aria-hidden`: a screen reader should hear the live region announcing that
 * content is loading, not a pile of empty boxes.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/* --- progress ------------------------------------------------------------- */

/** Course completion bar — feature LC7. */
export function ProgressBar({
  value,
  className,
  label,
}: {
  /** Percentage, 0..100. Clamped. */
  value: number;
  className?: string;
  label?: string;
}) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${percent}% complete`}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/* --- empty state ---------------------------------------------------------- */

/** The shared empty state — feature UI3. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {icon && <div className="text-muted-foreground [&_svg]:size-10">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* --- spinner -------------------------------------------------------------- */

/** Full-height centred spinner, for a route that is still resolving. */
export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 w-full items-center justify-center"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
