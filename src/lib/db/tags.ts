import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type PostTag = {
  id: string;
  post_id: string;
  tagged_user_id: string;
  created_at: string;
  tagged_user: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export async function getTagsForPost(postId: string): Promise<PostTag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_tags")
    .select(`
      id, post_id, tagged_user_id, created_at,
      tagged_user:profiles!post_tags_tagged_user_id_fkey ( id, username, display_name, avatar_url )
    `)
    .eq("post_id", postId);
  return (data ?? []) as unknown as PostTag[];
}
