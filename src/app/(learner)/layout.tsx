"use client";

import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { PageSpinner } from "@/components/ui/feedback";
import { useRequireAuth } from "@/hooks/use-require-auth";

/**
 * Learner shell.
 *
 * A client component because the guard reads the token from localStorage. The
 * children are held back until `isReady`, so protected chrome never paints for
 * a visitor who is about to be redirected.
 */
export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {isReady ? children : <PageSpinner label="Checking your session" />}
      </main>
      <Footer />
    </div>
  );
}
