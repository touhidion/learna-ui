import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, letting a later Tailwind class win over an earlier one
 * in the same group. `cn("p-2", "p-4")` yields `"p-4"`, which is what makes
 * component `className` props able to override defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "1h 25m", "45m", or "—" when a course has no recorded duration. */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** "2.4 MB". Binary units, matching what an OS file listing shows. */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/**
 * "3 January 2026".
 *
 * The locale is pinned rather than left to the visitor's: an unpinned locale
 * renders differently on the server and the client and trips a hydration
 * mismatch.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "2 days ago", "just now". Falls back to an absolute date past a month. */
export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const thresholds: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2592000, "week"],
  ];

  if (seconds < 45) return "just now";
  if (seconds > 2592000) return formatDate(iso);

  const formatter = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  let previous = 1;
  for (const [limit, unit] of thresholds) {
    if (seconds < limit) {
      return formatter.format(-Math.round(seconds / previous), unit);
    }
    previous = limit;
  }
  return formatDate(iso);
}

/** Clamps to 0..100 so a bad percentage cannot overflow a progress bar. */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/** "Ada Lovelace" -> "AL". Used for the avatar fallback. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Trims to `max` characters on a word boundary, appending an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${kept.trimEnd()}…`;
}

/**
 * Converts a YouTube or Vimeo URL into its embed form.
 *
 * Returns null for anything unrecognised, so a caller can fall back to a plain
 * link rather than dropping an arbitrary URL into an iframe.
 */
export function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}
