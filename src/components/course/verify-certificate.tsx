"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Check, CheckCircle2, Copy, ExternalLink, Share2, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CertificateShareDialog } from "@/components/course/certificate-share-dialog";
import { OfficialSeal } from "@/components/course/official-seal";
import { cn, formatDate } from "@/lib/utils";
import { env } from "@/lib/env";
import type { Certificate } from "@/types/course";

/** Certificate lookup form — feature UP4. */
export function VerifyForm() {
  const [number, setNumber] = useState("");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-16 text-center">
      <div className="relative mx-auto flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent p-1 shadow-inner ring-1 ring-amber-500/30">
        <div className="flex size-full items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-lg shadow-amber-500/25">
          <ShieldCheck className="size-10 text-slate-950" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Sparkles className="size-3.5" /> Learna Authenticity Registry
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Verify a Certificate</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Enter the unique certificate serial number to instantly validate its authenticity and credential status.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = number.trim().toUpperCase();
          if (trimmed) router.push(`/verify/${encodeURIComponent(trimmed)}`);
        }}
        className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="e.g. LEARNA-2026-ABC123"
          aria-label="Certificate number"
          className="h-11 font-mono text-center tracking-wider uppercase sm:text-left"
        />
        <Button
          type="submit"
          disabled={number.trim() === ""}
          className="h-11 bg-gradient-to-r from-amber-500 to-amber-600 font-medium text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
        >
          Verify Credential
        </Button>
      </form>
    </div>
  );
}

/**
 * Verification result — features UP4, CT5.
 */
export function VerifyResult({
  certNumber,
  certificate,
}: {
  certNumber: string;
  certificate: Certificate | null;
}) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const data = certificate;

  if (!data) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <ShieldX className="size-9" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Certificate Not Found</h1>
          <p className="text-sm text-muted-foreground">
            No credential exists with the serial number{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
              {certNumber}
            </span>
            . Please verify the code or check with the certificate holder.
          </p>
        </div>
        <Link href="/verify" className={cn(buttonVariants({ variant: "outline" }))}>
          Try another number
        </Link>
      </div>
    );
  }

  const verifyUrl = `${env.siteUrl}/verify/${data.cert_number}`;
  const issueDate = new Date(data.issued_at);
  const issueYear = issueDate.getFullYear();
  const issueMonth = issueDate.getMonth() + 1;

  // Direct official LinkedIn "Add to Profile" link
  const linkedinAddToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    data.course_title,
  )}&organizationName=${encodeURIComponent(
    env.siteName,
  )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    verifyUrl,
  )}&certId=${encodeURIComponent(data.cert_number)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success("Verification link copied.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      {/* Verification Status Banner with Social Share Suite */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="size-6 text-slate-950" />
          </div>
          <div>
            <h2 className="font-semibold text-emerald-950 dark:text-emerald-300">
              Official & Authenticated Credential
            </h2>
            <p className="text-xs text-muted-foreground">
              Issued and recorded in the Learna public ledger registry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add to LinkedIn Profile button */}
          <a
            href={linkedinAddToProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-1.5 bg-[#0A66C2] text-xs font-semibold text-white shadow-sm hover:bg-[#004182]",
            )}
          >
            <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
            </svg>
            <span>Add to LinkedIn</span>
          </a>

          {/* Social Share Menu Dialog button */}
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className="gap-1.5 text-xs">
            <Share2 className="size-3.5" />
            <span>Share</span>
          </Button>

          {/* Copy link button */}
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 text-xs">
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </Button>
        </div>
      </div>

      {/* Modern Luxury Golden Certificate Card Preview */}
      <div className="relative overflow-hidden rounded-3xl p-0.5 shadow-2xl bg-gradient-to-br from-amber-300 via-amber-500/40 to-yellow-600">
        <div className="relative rounded-[23px] bg-card p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-yellow-500/5 blur-3xl" />

          {/* Certificate Inner Decorative Border */}
          <div className="relative rounded-2xl border border-amber-500/30 p-6 sm:p-8">
            <div className="absolute -left-1.5 -top-1.5 size-3 border-l-2 border-t-2 border-amber-500" />
            <div className="absolute -right-1.5 -top-1.5 size-3 border-r-2 border-t-2 border-amber-500" />
            <div className="absolute -bottom-1.5 -left-1.5 size-3 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute -bottom-1.5 -right-1.5 size-3 border-b-2 border-r-2 border-amber-500" />

            <div className="space-y-8 text-center">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-3.5" /> Learna Academy Verified
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-foreground sm:text-3xl">
                  Certificate of Achievement
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  This is proudly presented to
                </p>
                <div className="relative inline-block">
                  <h4 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {data.user_name}
                  </h4>
                  <div className="mx-auto mt-2 h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  for successfully completing all curriculum requirements for
                </p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-xl">
                  {data.course_title}
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-amber-500/20 pt-6 sm:flex-row">
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Date of Issuance
                  </p>
                  <p className="text-sm font-semibold">{formatDate(data.issued_at)}</p>
                </div>

                <div className="flex size-20 flex-col items-center justify-center rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 p-2 text-slate-950 shadow-lg shadow-amber-500/30">
                  <Award className="size-6 text-slate-950" />
                  <span className="text-[8px] font-black uppercase tracking-tight">Learna Seal</span>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Certificate Number
                  </p>
                  <p className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                    {data.cert_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Share Dialog */}
      <CertificateShareDialog
        certificate={data}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}