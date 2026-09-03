import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export const metadata: Metadata = { title: "My certificates" };

export default function CertificatesPage() {
  return (
    <Placeholder
      title="My certificates"
      features="LCT1-LCT3, CT3"
      description="Earned certificates with download and a copyable verification link."
      backHref="/dashboard"
      backLabel="Back to my courses"
    />
  );
}
