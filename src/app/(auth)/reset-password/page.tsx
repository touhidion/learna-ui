import { Suspense } from "react";
import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { PageSpinner } from "@/components/ui/feedback";

export const metadata: Metadata = { title: "Reset password" };

/** The form reads ?token via useSearchParams, which needs a Suspense boundary. */
export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
