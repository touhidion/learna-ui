import type { Metadata } from "next";

import { CertificatesPage } from "@/components/course/certificates-page";

export const metadata: Metadata = { title: "My certificates" };

export default function Page() {
  return <CertificatesPage />;
}
