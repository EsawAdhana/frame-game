"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FollowResult =
  | { ok: true; following: boolean }
  | { ok: false; error: string };

export async function toggleFollow(targetUserId: string): Promise<FollowResult> {
  if (!targetUserId) return { ok: false, error: "Missing user." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (user.id === targetUserId) {
    return { ok: false, error: "You can't follow yourself." };
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("followee_id", targetUserId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", targetUserId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: targetUserId });
    if (error) return { ok: false, error: error.message };
  }

  // Refresh feed ordering and the target's profile page.
  revalidatePath("/today");
  revalidatePath("/notifications");
  const { data: target } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", targetUserId)
    .maybeSingle();
  if (target?.username) revalidatePath(`/u/${target.username}`);

  return { ok: true, following: !existing };
}
