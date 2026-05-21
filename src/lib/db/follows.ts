import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getFollowingIds(viewerId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("followee_id")
    .eq("follower_id", viewerId);
  return new Set((data ?? []).map((r) => r.followee_id as string));
}

export async function isFollowing(
  viewerId: string,
  targetId: string,
): Promise<boolean> {
  if (viewerId === targetId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", viewerId)
    .eq("followee_id", targetId)
    .maybeSingle();
  return !!data;
}
