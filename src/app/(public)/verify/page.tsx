import type { Metadata } from "next";

import { VerifyForm } from "@/components/course/verify-certificate";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Confirm a Learna certificate is genuine.",
};

export default function VerifyIndexPage() {
  return <VerifyForm />;
}
