"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar_url ?? "");

  async function action(formData: FormData) {
    formData.set("avatar_url", avatarUrl);
    setPending(true);
    const result = await updateProfile(formData);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Saved");
    router.refresh();
  }

  return (
    <form action={action} className="space-y-5">
      <div className="flex items-center gap-4">
        <AvatarUploader
          userId={profile.id}
          value={avatarUrl}
          onChange={setAvatarUrl}
        />
        <div className="text-xs text-muted-foreground">
          Tap your avatar to change it.
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Username
        </label>
        <Input
          name="username"
          defaultValue={profile.username}
          autoCapitalize="off"
          pattern="[a-z0-9_]{3,24}"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Display name
        </label>
        <Input name="display_name" defaultValue={profile.display_name ?? ""} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Bio
        </label>
        <Textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={160}
          placeholder="Max 160 characters."
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
