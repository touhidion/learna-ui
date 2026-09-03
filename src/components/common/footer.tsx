import Link from "next/link";

import { env } from "@/lib/env";

/** Public site footer — feature UP6. */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {env.siteName}. Self-hosted and free.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-6">
          <Link href="/courses" className="hover:text-foreground">
            Courses
          </Link>
          <Link href="/verify" className="hover:text-foreground">
            Verify a certificate
          </Link>
        </nav>
      </div>
    </footer>
  );
}
