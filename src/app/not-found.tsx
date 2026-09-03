import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Custom 404 — feature UI7. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          That page does not exist, or it has moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Go home
        </Link>
        <Link href="/courses" className={cn(buttonVariants({ variant: "outline" }))}>
          Browse courses
        </Link>
      </div>
    </div>
  );
}
