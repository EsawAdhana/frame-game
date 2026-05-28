import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getFollowingIds } from "@/lib/db/follows";
import type { PostDetail, PostWithAuthor } from "@/lib/types";

export type RankedFeed = {
  mine: PostWithAuthor[];
  friends: PostWithAuthor[];
  others: PostWithAuthor[];
};

type FeedRow = {
  id: string;
  user_id: string;
  prompt_id: string;
  image_path: string;
  caption: string | null;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  likes: { count: number }[] | null;
  comments: { count: number }[] | null;
  liked_by_me: { user_id: string }[] | null;
};

function publicUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/posts/${path}`;
}

function shapeRow(row: FeedRow, viewerId: string | null): PostWithAuthor {
  return {
    id: row.id,
    user_id: row.user_id,
    prompt_id: row.prompt_id,
    image_path: row.image_path,
    caption: row.caption,
    created_at: row.created_at,
    author: {
      id: row.profiles?.id ?? row.user_id,
      username: row.profiles?.username ?? "unknown",
      display_name: row.profiles?.display_name ?? null,
      avatar_url: row.profiles?.avatar_url ?? null,
    },
    image_url: publicUrl(row.image_path),
    like_count: row.likes?.[0]?.count ?? 0,
    comment_count: row.comments?.[0]?.count ?? 0,
    liked_by_me: viewerId
      ? (row.liked_by_me ?? []).some((l) => l.user_id === viewerId)
      : false,
  };
}

// Two-query approach: fetch posts+counts, then fetch the viewer's liked
// post ids separately. Avoids the !inner join that would drop un-liked posts.
const FEED_SELECT_SIMPLE = `
  id, user_id, prompt_id, image_path, caption, created_at,
  profiles:profiles!posts_user_id_fkey ( id, username, display_name, avatar_url ),
  likes:likes(count),
  comments:comments(count)
`;

const POST_DETAIL_SELECT = `
  ${FEED_SELECT_SIMPLE},
  prompts:prompts!posts_prompt_id_fkey ( text, active_date )
`;

type PostDetailRow = FeedRow & {
  prompts: { text: string; active_date: string } | null;
};

async function getViewerLikes(postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", user.id)
    .in("post_id", postIds);
  return new Set((data ?? []).map((r) => r.post_id));
}

export async function getFeedForPrompt(
  promptId: string,
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select(FEED_SELECT_SIMPLE)
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as FeedRow[];
  const likedSet = await getViewerLikes(rows.map((r) => r.id));
  return rows.map((r) => {
    const shaped = shapeRow(r, user?.id ?? null);
    shaped.liked_by_me = likedSet.has(r.id);
    return shaped;
  });
}

/**
 * Returns today's feed partitioned into the viewer's own post, posts by
 * users the viewer follows ("friends"), and everyone else. Each non-self
 * bucket is sorted by like count desc, then created_at desc.
 */
export async function getRankedFeedForPrompt(
  promptId: string,
): Promise<RankedFeed> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select(FEED_SELECT_SIMPLE)
    .eq("prompt_id", promptId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as FeedRow[];
  const likedSet = await getViewerLikes(rows.map((r) => r.id));
  const followingIds = user
    ? await getFollowingIds(user.id)
    : new Set<string>();

  const mine: PostWithAuthor[] = [];
  const friends: PostWithAuthor[] = [];
  const others: PostWithAuthor[] = [];
  for (const r of rows) {
    const shaped = shapeRow(r, user?.id ?? null);
    shaped.liked_by_me = likedSet.has(r.id);
    if (user && shaped.user_id === user.id) {
      mine.push(shaped);
    } else if (followingIds.has(shaped.user_id)) {
      friends.push(shaped);
    } else {
      others.push(shaped);
    }
  }

  const byLikesThenRecent = (a: PostWithAuthor, b: PostWithAuthor) =>
    b.like_count - a.like_count ||
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  friends.sort(byLikesThenRecent);
  others.sort(byLikesThenRecent);

  return { mine, friends, others };
}

export async function getPostById(id: string): Promise<PostDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("posts")
    .select(POST_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as PostDetailRow;
  const likedSet = await getViewerLikes([row.id]);
  const shaped = shapeRow(row, user?.id ?? null);
  shaped.liked_by_me = likedSet.has(row.id);
  return {
    ...shaped,
    prompt: row.prompts
      ? { text: row.prompts.text, active_date: row.prompts.active_date }
      : null,
  };
}

export async function getPostsByUsername(
  username: string,
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return [];
  const { data } = await supabase
    .from("posts")
    .select(FEED_SELECT_SIMPLE)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as FeedRow[];
  const likedSet = await getViewerLikes(rows.map((r) => r.id));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return rows.map((r) => {
    const shaped = shapeRow(r, user?.id ?? null);
    shaped.liked_by_me = likedSet.has(r.id);
    return shaped;
  });
}

/** Has the current user already posted for the given prompt? */
export async function hasPostedForPrompt(promptId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("prompt_id", promptId)
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
}

export function postImageUrl(path: string) {
  return publicUrl(path);
}
