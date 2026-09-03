import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { PageSpinner } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Sign in" };

/**
 * The form reads the `next` query parameter through useSearchParams, which
 * forces a client boundary — Suspense supplies the fallback Next requires.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
