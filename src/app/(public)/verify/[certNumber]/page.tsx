import type { Metadata } from "next";

import { Placeholder } from "@/components/common/placeholder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}): Promise<Metadata> {
  const { certNumber } = await params;
  return { title: `Certificate ${certNumber}` };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}) {
  const { certNumber } = await params;

  return (
    <Placeholder
      title={`Certificate ${certNumber}`}
      features="UP4, CT5"
      description="Holder name, course and issue date — or a clear not-found."
      backHref="/verify"
      backLabel="Verify another"
    />
  );
}
