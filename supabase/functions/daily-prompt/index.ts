// Supabase Edge Function: daily-prompt
// Picks an unused prompt from prompt_pool and promotes it to prompts for today.
// Schedule via Supabase Dashboard (Edge Functions -> Schedules -> "0 0 * * *").
//
// Local invoke:
//   supabase functions invoke daily-prompt
//
// This file runs in Deno on Supabase's edge runtime — not Node. It is excluded
// from the Next.js eslint/tsc passes; do not import it from the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const today = new Date().toISOString().slice(0, 10);

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
