import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pacific timezone — daily prompts roll over at noon local time. */
export const PROMPT_TIMEZONE = "America/Los_Angeles";

/**
 * Returns the active prompt date (YYYY-MM-DD). A new prompt day starts at
 * 12:00 PM Pacific; before noon, we still use the previous calendar date.
 */
export function todayPromptDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROMPT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  let year = get("year");
  let month = get("month");
  let day = get("day");
  const hour = get("hour");

  if (hour < 12) {
    const prev = new Date(Date.UTC(year, month - 1, day));
    prev.setUTCDate(prev.getUTCDate() - 1);
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Format a prompt active_date label without timezone drift. */
export function formatPromptDate(
  activeDate: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  const [y, m, d] = activeDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, options);
}

/** Human relative time for feed timestamps. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
