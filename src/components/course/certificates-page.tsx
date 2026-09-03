"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Download, Eye, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { CertificateShareDialog } from "@/components/course/certificate-share-dialog";
import { useMyCertificates } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import type { Certificate } from "@/types/course";

/** My certificates — features LCT1, LCT2, LCT3 with modern golden design and social sharing. */
export function CertificatesPage() {
  const { data, isLoading } = useMyCertificates();
  const certificates = data?.certificates ?? [];
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [shareCert, setShareCert] = useState<Certificate | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      {/* Golden Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" /> Certified Credentials
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your Achievements</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Accredited completion certificates verifiable worldwide with tamper-proof serial numbers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20">
              <Award className="size-8" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="text-amber-500" />}
          title="No certificates earned yet"
          description="Complete all lessons across any enrolled course to unlock your verified certificate."
          action={
            <Link href="/dashboard" className={cn(buttonVariants({ className: "bg-amber-600 hover:bg-amber-700 text-white" }))}>
              Continue Learning
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-1">
          {certificates.map((c) => (
            <CertificateRow
              key={c.id}
              certificate={c}
              onPreview={() => setPreviewCert(c)}
              onShare={() => setShareCert(c)}
            />
          ))}
        </ul>
      )}

      {/* Certificate Preview Modal */}
      {previewCert && (
        <Dialog
          open={Boolean(previewCert)}
          onClose={() => setPreviewCert(null)}
          title="Certificate Credential Preview"
          description="Official verified certificate issued by Learna Academy."
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent p-4 sm:p-6 text-center">
            <div className="rounded-xl border border-amber-500/30 p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Learna Academy
                </p>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-foreground">
                  Certificate of Achievement
                </h3>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Awarded to</p>
                <h4 className="text-2xl font-bold">{previewCert.user_name}</h4>
                <div className="mx-auto h-0.5 w-24 bg-amber-500" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">for completing</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {previewCert.course_title}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-amber-500/20 pt-4 text-xs text-muted-foreground">
                <div>Issued: {formatDate(previewCert.issued_at)}</div>
                <div className="font-mono font-semibold text-foreground">
                  {previewCert.cert_number}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Certificate Social Share Dialog */}
      <CertificateShareDialog
        certificate={shareCert}
        open={Boolean(shareCert)}
        onClose={() => setShareCert(null)}
      />
    </div>
  );
}

function CertificateRow({
  certificate,
  onPreview,
  onShare,
}: {
  certificate: Certificate;
  onPreview: () => void;
  onShare: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

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
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      toast.error("Could not download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <li className="list-none">
      <Card className="group relative overflow-hidden border-border/80 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600" />

        <CardContent className="flex flex-col gap-5 p-5 pl-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
              <Award className="size-6" aria-hidden="true" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
                  {certificate.course_title}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20">
                  Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Issued on {formatDate(certificate.issued_at)}
              </p>
              <p className="font-mono text-xs font-medium text-amber-600/90 dark:text-amber-400/90">
                {certificate.cert_number}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Button variant="outline" size="sm" onClick={onPreview} className="gap-1.5 text-xs">
              <Eye className="size-3.5" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={onShare} className="gap-1.5 text-xs">
              <Share2 className="size-3.5" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={download}
              isLoading={downloading}
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
            >
              <Download className="size-3.5" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}