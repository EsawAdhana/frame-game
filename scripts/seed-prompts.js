#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Loads seed/prompts.json into the prompt_pool table.
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 *   node scripts/seed-prompts.js
 */
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env.",
    );
    process.exit(1);
  }
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const prompts = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "seed", "prompts.json"), "utf8"),
  );

  const { data: existing, error: readErr } = await supabase
    .from("prompt_pool")
    .select("text");
  if (readErr) throw readErr;

  const have = new Set((existing ?? []).map((r) => r.text));
  const toInsert = prompts.filter((t) => !have.has(t)).map((text) => ({ text }));

  if (toInsert.length === 0) {
    console.log(`prompt_pool already has all ${prompts.length} prompts.`);
  } else {
    const { error: insertErr } = await supabase
      .from("prompt_pool")
      .insert(toInsert);
    if (insertErr) throw insertErr;
    console.log(`Inserted ${toInsert.length} new prompts.`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: todays } = await supabase
    .from("prompts")
    .select("id")
    .eq("active_date", today)
    .maybeSingle();
  if (todays) {
    console.log(`Prompt for ${today} already exists.`);
    return;
  }

  const { data: candidate } = await supabase
    .from("prompt_pool")
    .select("id, text")
    .is("used_on", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!candidate) {
    console.warn("No unused prompts left in the pool.");
    return;
  }
  const { error: promoteErr } = await supabase
    .from("prompts")
    .insert({ text: candidate.text, active_date: today });
  if (promoteErr) throw promoteErr;
  await supabase
    .from("prompt_pool")
    .update({ used_on: today })
    .eq("id", candidate.id);
  console.log(`Seeded today's prompt: "${candidate.text}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
