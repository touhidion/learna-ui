/**
 * Client-visible environment, validated once at module load.
 *
 * Next.js inlines `NEXT_PUBLIC_*` at build time, so `process.env` must be read
 * with the full literal key — destructuring or dynamic lookup produces
 * `undefined` in the browser bundle.
 */

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Strips a trailing slash so joins never produce a double slash. */
function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const env = {
  /** Base URL of learna-api, without a trailing slash. */
  apiUrl: normalizeUrl(rawApiUrl),
  /** Public origin of this app, used for canonical and Open Graph URLs. */
  siteUrl: normalizeUrl(rawSiteUrl),
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Learna",
  isProduction: process.env.NODE_ENV === "production",
} as const;

/** Versioned API root: `http://localhost:8080/api/v1`. */
export const API_BASE = `${env.apiUrl}/api/v1`;
