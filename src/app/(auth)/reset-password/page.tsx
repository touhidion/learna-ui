import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Placeholder
      title="Reset password"
      features="UA4"
      description="Set a new password using the token from the reset link. API endpoint A6 is live."
      backHref="/login"
      backLabel="Back to sign in"
    />
  );
}
