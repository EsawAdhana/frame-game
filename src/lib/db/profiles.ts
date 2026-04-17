import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return data;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/** Returns true if the given username is free (case-insensitive). */
export async function isUsernameAvailable(
  username: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase());
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !data;
}
