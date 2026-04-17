import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayUtcDate } from "@/lib/utils";
import type { Prompt } from "@/lib/types";

/**
 * Reads today's prompt. If none exists yet, the daily cron hasn't run — fall
 * back to promoting one on-demand using the service role (same logic as the
 * Edge Function). Idempotent: concurrent calls collapse to a single row
 * thanks to the unique active_date constraint.
 */
export async function getTodayPrompt(): Promise<Prompt | null> {
  const supabase = await createClient();
  const today = todayUtcDate();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("active_date", today)
    .maybeSingle();
  if (data) return data;

  try {
    return await promoteTodayPrompt();
  } catch {
    return null;
  }
}

export async function getPromptByDate(date: string): Promise<Prompt | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("active_date", date)
    .maybeSingle();
  return data;
}

export async function listPastPrompts(limit = 60): Promise<Prompt[]> {
  const supabase = await createClient();
  const today = todayUtcDate();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .lt("active_date", today)
    .order("active_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/**
 * Server-only: promote an unused prompt_pool row into today's prompt.
 * Uses the service role to bypass RLS (prompt_pool is admin-only).
 */
export async function promoteTodayPrompt(): Promise<Prompt | null> {
  const admin = createAdminClient();
  const today = todayUtcDate();

  const { data: existing } = await admin
    .from("prompts")
    .select("*")
    .eq("active_date", today)
    .maybeSingle();
  if (existing) return existing;

  const { data: candidate } = await admin
    .from("prompt_pool")
    .select("id, text")
    .is("used_on", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!candidate) return null;

  const { data: inserted, error } = await admin
    .from("prompts")
    .insert({ text: candidate.text, active_date: today })
    .select()
    .single();
  if (error) {
    const { data: raced } = await admin
      .from("prompts")
      .select("*")
      .eq("active_date", today)
      .maybeSingle();
    return raced ?? null;
  }
  await admin
    .from("prompt_pool")
    .update({ used_on: today })
    .eq("id", candidate.id);
  return inserted;
}
