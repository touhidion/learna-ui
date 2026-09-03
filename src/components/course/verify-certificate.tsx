"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, ShieldCheck, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/types/course";

/** Certificate lookup form — feature UP4. */
export function VerifyForm() {
  const [number, setNumber] = useState("");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
      <ShieldCheck className="mx-auto size-10 text-primary" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Verify a certificate</h1>
        <p className="text-sm text-muted-foreground">
          Enter the certificate number to confirm it is genuine. No account needed.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = number.trim().toUpperCase();
          if (trimmed) router.push(`/verify/${encodeURIComponent(trimmed)}`);
        }}
        className="flex gap-2"
      >
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="LEARNA-2026-ABC123"
          aria-label="Certificate number"
          className="font-mono"
        />
        <Button type="submit" disabled={number.trim() === ""}>
          Verify
        </Button>
      </form>
    </div>
  );
}

/**
 * Verification result — features UP4, CT5.
 *
 * A "not found" is a legitimate answer here, not an error state: the whole
 * point is to tell someone a number is not genuine.
 */
export function VerifyResult({
  certNumber,
  certificate,
}: {
  certNumber: string;
  /** Resolved on the server: a verification link is shared publicly, so the
   *  answer has to be in the initial HTML rather than behind a fetch. */
  certificate: Certificate | null;
}) {
  const data = certificate;

  if (!data) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <ShieldX className="mx-auto size-10 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight">Not verified</h1>
        <p className="text-sm text-muted-foreground">
          No certificate exists with the number{" "}
          <span className="font-mono">{certNumber}</span>. Check for a typo, or treat it
          as invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-16">
      <div className="text-center">
        <ShieldCheck className="mx-auto size-10 text-success" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Certificate verified</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This certificate was issued by Learna and is genuine.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Award className="size-8 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Course</p>
              <p className="font-medium">{data.course_title}</p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Awarded to
              </dt>
              <dd className="font-medium">{data.user_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Issued on
              </dt>
              <dd className="font-medium">{formatDate(data.issued_at)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Certificate number
              </dt>
              <dd className="font-mono text-sm">{data.cert_number}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
