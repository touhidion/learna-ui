"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { useMyCertificates } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import { cn, formatDate } from "@/lib/utils";
import type { Certificate } from "@/types/course";

/** My certificates — features LCT1, LCT2, LCT3. */
export function CertificatesPage() {
  const { data, isLoading } = useMyCertificates();
  const certificates = data?.certificates ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Certificates</h1>
        <p className="text-sm text-muted-foreground">
          Everything you have completed. Each one is publicly verifiable.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award />}
          title="No certificates yet"
          description="Finish every lesson in a course to earn one."
          action={
            <Link href="/dashboard" className={cn(buttonVariants())}>
              My courses
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {certificates.map((c) => (
            <CertificateRow key={c.id} certificate={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CertificateRow({ certificate }: { certificate: Certificate }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const verifyUrl = `${env.siteUrl}/verify/${certificate.cert_number}`;

  /**
   * The PDF endpoint requires the Authorization header, so a plain <a href>
   * would 401. The file is fetched through the API client and handed to the
   * browser as an object URL instead.
   */
  async function download() {
    setDownloading(true);
    try {
      const res = await api.get(`/certificates/download/${certificate.id}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificate.cert_number}.pdf`;
      a.click();
      // Revoking immediately can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      toast.error("Could not download the certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success("Verification link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Copy the link from the address bar instead.");
    }
  }

  return (
    <li>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Award className="size-8 shrink-0 text-primary" aria-hidden="true" />

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-medium">{certificate.course_title}</h2>
            <p className="text-sm text-muted-foreground">
              Issued {formatDate(certificate.issued_at)}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {certificate.cert_number}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Share"}
            </Button>
            <Button size="sm" onClick={download} isLoading={downloading}>
              <Download aria-hidden="true" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
