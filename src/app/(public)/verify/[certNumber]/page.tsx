import type { Metadata } from "next";

import { VerifyResult } from "@/components/course/verify-certificate";
import { API_BASE } from "@/lib/env";
import type { Certificate } from "@/types/course";

/**
 * A verification link is shared with third parties, so the answer is resolved
 * on the server — the page must be meaningful without JavaScript and to a
 * crawler (features UP4, CT5).
 */
async function verify(certNumber: string): Promise<Certificate | null> {
  try {
    const res = await fetch(
      `${API_BASE}/certificates/verify/${encodeURIComponent(certNumber)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as Certificate;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}): Promise<Metadata> {
  const { certNumber } = await params;
  const cert = await verify(decodeURIComponent(certNumber));
  return {
    title: cert ? `${cert.user_name} - ${cert.course_title}` : `Certificate ${certNumber}`,
    // Certificates name a real person; keep them out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}) {
  const { certNumber } = await params;
  const decoded = decodeURIComponent(certNumber);
  return <VerifyResult certNumber={decoded} certificate={await verify(decoded)} />;
}