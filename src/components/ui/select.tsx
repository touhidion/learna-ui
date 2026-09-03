import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A native `<select>` styled to match the other form controls — feature UI1.
 *
 * Native rather than a custom listbox: it gets correct keyboard behaviour,
 * screen-reader support and the platform picker on mobile for free, and none
 * of the admin filters need multi-select or search.
 */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(({ className, hasError = false, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {/* appearance-none removes the native arrow, so one is drawn back in. */}
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  </div>
));
Select.displayName = "Select";
