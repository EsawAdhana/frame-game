"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isUsernameAvailable } from "@/lib/db/profiles";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(24, "At most 24 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and underscores only"),
  display_name: z.string().max(40).optional().or(z.literal("")),
  bio: z.string().max(160).optional().or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type ProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const parsed = profileSchema.safeParse({
    username: String(formData.get("username") ?? "").toLowerCase().trim(),
    display_name: String(formData.get("display_name") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    avatar_url: String(formData.get("avatar_url") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (!(await isUsernameAvailable(parsed.data.username, user.id))) {
    return { ok: false, error: "That username is taken." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatar_url || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
