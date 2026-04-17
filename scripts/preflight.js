#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Pre-launch sanity check.
 * Verifies env vars, table presence, prompt pool state, and today's prompt.
 *
 *   node scripts/preflight.js
 */
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

async function main() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("❌ Missing env vars:", missing.join(", "));
    process.exit(1);
  }
  console.log("✓ Env vars present.");

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const tables = [
    "profiles",
    "prompts",
    "prompt_pool",
    "posts",
    "likes",
    "comments",
    "reports",
  ];
  for (const t of tables) {
    const { error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.error(`❌ Table "${t}" not reachable: ${error.message}`);
      process.exit(1);
    }
    console.log(`✓ Table "${t}" reachable.`);
  }

  const { count: poolCount } = await supabase
    .from("prompt_pool")
    .select("*", { count: "exact", head: true })
    .is("used_on", null);
  console.log(`✓ Unused prompts in pool: ${poolCount}`);
  if ((poolCount ?? 0) < 7) {
    console.warn("⚠️  Fewer than 7 unused prompts left — reseed soon.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: todaysPrompt } = await supabase
    .from("prompts")
    .select("text")
    .eq("active_date", today)
    .maybeSingle();
  if (!todaysPrompt) {
    console.warn(
      `⚠️  No prompt for ${today} yet. Run the cron (or node scripts/seed-prompts.js) before launch.`,
    );
  } else {
    console.log(`✓ Today's prompt: "${todaysPrompt.text}"`);
  }

  for (const bucket of ["posts", "avatars"]) {
    const { data } = await supabase.storage.getBucket(bucket);
    if (!data) {
      console.warn(`⚠️  Storage bucket "${bucket}" missing. Re-apply 0002_rls.sql.`);
    } else {
      console.log(`✓ Storage bucket "${bucket}" present (public=${data.public}).`);
    }
  }

  console.log("\nAll checks complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
