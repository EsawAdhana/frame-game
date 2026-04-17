"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTodayPrompt } from "@/lib/db/prompts";

const postSchema = z.object({
  caption: z.string().max(280).optional(),
  image_path: z.string().min(1),
});

export type PostResult =
  | { ok: true; postId: string }
  | { ok: false; error: string };

export async function createPost(formData: FormData): Promise<PostResult> {
  const parsed = postSchema.safeParse({
    caption: String(formData.get("caption") ?? "").trim(),
    image_path: String(formData.get("image_path") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const prompt = await getTodayPrompt();
  if (!prompt) return { ok: false, error: "No prompt available today." };

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      prompt_id: prompt.id,
      image_path: parsed.data.image_path,
      caption: parsed.data.caption || null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique violation = already posted today
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "You already posted for today's prompt." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/today");
  revalidatePath("/");
  return { ok: true, postId: data.id };
}

export async function deletePost(postId: string): Promise<PostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: post } = await supabase
    .from("posts")
    .select("id, user_id, image_path")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  if (post.user_id !== user.id)
    return { ok: false, error: "Not your post." };

  await supabase.from("posts").delete().eq("id", postId);
  await supabase.storage.from("posts").remove([post.image_path]);
  revalidatePath("/today");
  return { ok: true, postId };
}

export async function toggleLike(
  postId: string,
): Promise<{ ok: true; liked: boolean } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    revalidatePath(`/post/${postId}`);
    return { ok: true, liked: false };
  }
  await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  revalidatePath(`/post/${postId}`);
  return { ok: true, liked: true };
}

export async function reportPost(
  postId: string,
  reason: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { error } = await supabase.from("reports").insert({
    post_id: postId,
    user_id: user.id,
    reason: reason.trim().slice(0, 500) || null,
  });
  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "You've already reported this." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function addComment(
  postId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Empty comment." };
  if (trimmed.length > 500) return { ok: false, error: "Too long (max 500)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body: trimmed });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}
