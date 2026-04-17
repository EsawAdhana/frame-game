import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/lib/types";

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(
      `id, post_id, user_id, body, created_at,
       author:profiles!comments_user_id_fkey ( id, username, display_name, avatar_url )`,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as Comment[];
}
