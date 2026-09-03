import Link from "next/link";
import { ArrowLeft, GraduationCap, Sparkles } from "lucide-react";

import { env } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform-gpu">
        <div className="h-[400px] w-[600px] bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent blur-[100px]" />
      </div>

      {/* Top Brand Logo */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">{env.siteName}</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">{children}</div>

      {/* Back to Home Link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to homepage</span>
        </Link>
      </div>
    </div>
  );
}