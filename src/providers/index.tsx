"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

/**
 * Every client-side provider, composed once for the root layout.
 *
 * Order matters: AuthProvider issues requests through the API client, so it
 * sits inside QueryProvider, and both sit inside ThemeProvider so a theme
 * change never remounts the session.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // The cross-fade on every theme change is more distracting than helpful.
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
