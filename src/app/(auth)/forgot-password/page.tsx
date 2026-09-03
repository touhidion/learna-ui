import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Placeholder
      title="Forgot password"
      features="UA3"
      description="Request a reset link. The API endpoint (A5) is live; this form is next."
      backHref="/login"
      backLabel="Back to sign in"
    />
  );
}
