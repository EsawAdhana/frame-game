/**
 * Shared prompt-day logic for Node scripts. Keep in sync with src/lib/utils.ts.
 */
const PROMPT_TIMEZONE = "America/Los_Angeles";

function todayPromptDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROMPT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type) =>
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

module.exports = { todayPromptDate, PROMPT_TIMEZONE };
