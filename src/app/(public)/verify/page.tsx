import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "Verify a certificate" };

export default function VerifyIndexPage() {
  return (
    <Placeholder
      title="Verify a certificate"
      features="UP4, CT5"
      description="Enter a certificate number to confirm it is genuine. No account needed."
      backHref="/"
      backLabel="Back home"
    />
  );
}
