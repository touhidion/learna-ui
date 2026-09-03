import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { env } from "@/lib/env";

/** Centred, chrome-free shell for the sign-in and password routes. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="size-6 text-primary" aria-hidden="true" />
        <span>{env.siteName}</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
