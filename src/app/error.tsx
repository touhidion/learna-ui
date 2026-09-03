"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary — feature UI8.
 *
 * Next passes `reset`, which re-renders the segment; that is enough to recover
 * from a failed fetch without a full page reload.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real reporter when one is wired up.
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page could not be loaded. Trying again often clears it.
        </p>
        {/* The digest is the only handle support has on a production error;
            the message itself is stripped from the client bundle. */}
        {error.digest && (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>
        <RotateCcw aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
