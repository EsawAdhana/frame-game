// Supabase Edge Function: daily-prompt
// Picks an unused prompt from prompt_pool and promotes it to prompts for today.
// Schedule via Supabase Dashboard (Edge Functions -> Schedules -> "0 19 * * *"
// for 12:00 PM Pacific during PDT, or "0 20 * * *" during PST).
//
// Local invoke:
//   supabase functions invoke daily-prompt
//
// This file runs in Deno on Supabase's edge runtime — not Node. It is excluded
// from the Next.js eslint/tsc passes; do not import it from the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROMPT_TIMEZONE = "America/Los_Angeles";

function todayPromptDate(now = new Date()): string {
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

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const today = todayPromptDate();

  const { data: existing } = await supabase
    .from("prompts")
    .select("id")
    .eq("active_date", today)
    .maybeSingle();
  if (existing) {
    return new Response(
      JSON.stringify({ ok: true, already: true, date: today }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: candidate, error: candErr } = await supabase
    .from("prompt_pool")
    .select("id, text")
    .is("used_on", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (candErr) {
    return new Response(JSON.stringify({ ok: false, error: candErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!candidate) {
    return new Response(
      JSON.stringify({ ok: false, error: "prompt_pool empty" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const { error: promoteErr } = await supabase
    .from("prompts")
    .insert({ text: candidate.text, active_date: today });
  if (promoteErr) {
    return new Response(JSON.stringify({ ok: false, error: promoteErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  await supabase
    .from("prompt_pool")
    .update({ used_on: today })
    .eq("id", candidate.id);

  return new Response(
    JSON.stringify({ ok: true, prompt: candidate.text, date: today }),
    { headers: { "Content-Type": "application/json" } },
  );
});
