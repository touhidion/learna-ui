import Link from "next/link";
import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/feedback";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Scaffolding for a route that exists but is not built yet.
 *
 * Every Phase 1 route is registered so the navigation, layouts and auth guards
 * can be exercised end to end from day one. Each placeholder names the feature
 * IDs from docs/learna-features.md that will replace it, so the route tree
 * doubles as the work list.
 */
export function Placeholder({
  title,
  features,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  /** Feature IDs from the features doc, e.g. "LD1, LD2". */
  features: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto flex min-h-96 max-w-2xl flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <Construction className="size-10 text-muted-foreground" aria-hidden="true" />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <Badge variant="secondary">Features {features}</Badge>

      {backHref && (
        <Link href={backHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {backLabel ?? "Go back"}
        </Link>
      )}
    </div>
  );
}
