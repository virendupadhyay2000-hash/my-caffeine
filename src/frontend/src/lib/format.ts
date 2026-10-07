import type { ExternalBlob } from "@/backend";

/** Motoko `Time.now()` returns nanosecond bigints. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a readable date, or a fallback string. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format a backend timestamp as a readable date + time. */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Group a number with Indian digit grouping (e.g. 4,320). */
export function formatNumber(value: bigint | number): string {
  return Number(value).toLocaleString("en-IN");
}

/** Format a budget in whole rupees with Indian digit grouping. */
export function formatBudget(value: bigint): string {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

/** Percentage of resolved problems, rounded to a whole number. */
export function resolutionRate(resolved: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(resolved) / Number(total)) * 100);
}

/** Detect whether an uploaded file is an image from its filename. */
export function isImageFile(filename: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename);
}

/** Resolve a display URL for an uploaded blob, or null when absent. */
export function blobUrl(blob?: ExternalBlob): string | null {
  if (!blob) return null;
  try {
    return blob.getDirectURL();
  } catch {
    return null;
  }
}

/** Truncate long text for card previews. */
export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
