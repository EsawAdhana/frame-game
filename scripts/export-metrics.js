#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Export usage metrics for the CS 278 final paper.
 *
 *   node --env-file=.env.local scripts/export-metrics.js
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (same as preflight).
 */
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function pct(n, total) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

async function main() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing env vars:", missing.join(", "));
    process.exit(1);
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const [
    { count: profileCount },
    { data: profiles },
    { data: posts },
    { data: likes },
    { data: comments },
    { data: follows },
    { data: prompts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, username, created_at"),
    supabase
      .from("posts")
      .select("id, user_id, prompt_id, created_at, prompts(active_date)"),
    supabase.from("likes").select("id, user_id, post_id, created_at"),
    supabase.from("comments").select("id, user_id, post_id, created_at"),
    supabase.from("follows").select("follower_id, followee_id, created_at"),
    supabase.from("prompts").select("id, active_date, text").order("active_date"),
  ]);

  const profileIds = new Set((profiles ?? []).map((p) => p.id));
  const posters = new Set((posts ?? []).map((p) => p.user_id));
  const likers = new Set((likes ?? []).map((l) => l.user_id));
  const commenters = new Set((comments ?? []).map((c) => c.user_id));
  const activeUsers = new Set([...posters, ...likers, ...commenters]);
  const lurkers = [...profileIds].filter((id) => !activeUsers.has(id));

  const followCountByUser = new Map();
  for (const f of follows ?? []) {
    followCountByUser.set(
      f.follower_id,
      (followCountByUser.get(f.follower_id) ?? 0) + 1,
    );
  }
  const avgFollows =
    profileIds.size > 0
      ? [...followCountByUser.values()].reduce((a, b) => a + b, 0) /
        profileIds.size
      : 0;

  const postsByDate = new Map();
  for (const p of posts ?? []) {
    const date = p.prompts?.active_date ?? "unknown";
    postsByDate.set(date, (postsByDate.get(date) ?? 0) + 1);
  }

  const likesByPost = new Map();
  for (const l of likes ?? []) {
    likesByPost.set(l.post_id, (likesByPost.get(l.post_id) ?? 0) + 1);
  }
  const commentsByPost = new Map();
  for (const c of comments ?? []) {
    commentsByPost.set(c.post_id, (commentsByPost.get(c.post_id) ?? 0) + 1);
  }

  const usernameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.username]),
  );

  console.log("=== FrameGame usage metrics ===\n");
  console.log(`Generated: ${new Date().toISOString()}\n`);

  console.log("--- Signups & active users ---");
  console.log(`Total signups (profiles): ${profileCount ?? 0}`);
  console.log(`Posted at least once:     ${posters.size} (${pct(posters.size, profileCount ?? 0)})`);
  console.log(`Liked at least once:    ${likers.size} (${pct(likers.size, profileCount ?? 0)})`);
  console.log(`Commented at least once:${commenters.size} (${pct(commenters.size, profileCount ?? 0)})`);
  console.log(`Active users (any):     ${activeUsers.size} (${pct(activeUsers.size, profileCount ?? 0)})`);
  console.log(`Lurkers (signed up, no contribution): ${lurkers.length}`);

  console.log("\n--- Posts per prompt day ---");
  if (postsByDate.size === 0) {
    console.log("(no posts yet)");
  } else {
    for (const [date, count] of [...postsByDate.entries()].sort()) {
      const prompt = (prompts ?? []).find((pr) => pr.active_date === date);
      const label = prompt?.text ? `"${prompt.text}"` : "";
      console.log(`  ${date}: ${count} posts ${label}`);
    }
  }

  console.log("\n--- Engagement ---");
  console.log(`Total posts:    ${posts?.length ?? 0}`);
  console.log(`Total likes:    ${likes?.length ?? 0}`);
  console.log(`Total comments: ${comments?.length ?? 0}`);
  console.log(`Total follows:  ${follows?.length ?? 0}`);
  console.log(`Avg follows per user: ${avgFollows.toFixed(1)}`);

  if ((posts ?? []).length > 0) {
    console.log("\n--- Per-post engagement ---");
    for (const p of posts ?? []) {
      const uname = usernameById.get(p.user_id) ?? p.user_id.slice(0, 8);
      const lc = likesByPost.get(p.id) ?? 0;
      const cc = commentsByPost.get(p.id) ?? 0;
      const date = p.prompts?.active_date ?? "?";
      console.log(`  @${uname} (${date}): ${lc} likes, ${cc} comments`);
    }
  }

  if (lurkers.length > 0) {
    console.log("\n--- Lurkers (no post/like/comment) ---");
    for (const id of lurkers) {
      console.log(`  @${usernameById.get(id) ?? id.slice(0, 8)}`);
    }
  }

  console.log("\n--- Prompt history ---");
  for (const pr of prompts ?? []) {
    const count = postsByDate.get(pr.active_date) ?? 0;
    console.log(`  ${pr.active_date}: ${count} posts — "${pr.text}"`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
