"use client";

import { useState } from "react";
import { Award, Check, Copy, ExternalLink, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/types/course";

export function CertificateShareDialog({
  certificate,
  open,
  onClose,
}: {
  certificate: Certificate | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const verifyUrl = `${env.siteUrl}/verify/${certificate.cert_number}`;
  const issueDate = new Date(certificate.issued_at);
  const issueYear = issueDate.getFullYear();
  const issueMonth = issueDate.getMonth() + 1;

  // Official LinkedIn "Add to Profile" URL
  const linkedinAddToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificate.course_title,
  )}&organizationName=${encodeURIComponent(
    env.siteName,
  )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    verifyUrl,
  )}&certId=${encodeURIComponent(certificate.cert_number)}`;

  // LinkedIn Post Share URL
  const linkedinSharePostUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    verifyUrl,
  )}`;

  // X / Twitter Share URL
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `I just earned my verified certificate in "${certificate.course_title}" from ${env.siteName}! Check out my verified credential:`,
  )}&url=${encodeURIComponent(verifyUrl)}`;

  // WhatsApp Share URL
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out my verified certificate for "${certificate.course_title}": ${verifyUrl}`,
  )}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success("Verification link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share Your Certificate"
      description="Showcase your verified achievement on LinkedIn, social media, or share the public verification link."
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Certificate Mini Summary Card */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-md shadow-amber-500/20">
            <Award className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-foreground">
              {certificate.course_title}
            </h4>
            <p className="text-xs text-muted-foreground">
              Issued {formatDate(certificate.issued_at)} • {certificate.cert_number}
            </p>
          </div>
        </div>

        {/* Primary Social Actions */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add to Professional Profile
          </p>

          {/* LinkedIn Add to Profile (Official Certification Link) */}
          <a
            href={linkedinAddToProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 p-3.5 font-medium text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20 dark:text-[#70B5F9]"
          >
            <div className="flex items-center gap-3">
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
              </svg>
              <span className="text-sm font-semibold">Add to LinkedIn Profile</span>
            </div>
            <ExternalLink className="size-4 opacity-70" />
          </a>

          {/* Social Share Buttons Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* LinkedIn Feed */}
            <a
              href={linkedinSharePostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 p-3 text-xs font-medium text-foreground transition-all hover:border-[#0A66C2]/40 hover:bg-muted"
            >
              <svg className="size-4 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
              </svg>
              <span>Post to Feed</span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 p-3 text-xs font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-muted"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 p-3 text-xs font-medium text-foreground transition-all hover:border-emerald-500/40 hover:bg-muted"
            >
              <svg className="size-4 fill-emerald-500" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.5c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Direct Link Copy */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Public Verification Link
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={verifyUrl}
              className="font-mono text-xs text-muted-foreground"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 shrink-0">
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}