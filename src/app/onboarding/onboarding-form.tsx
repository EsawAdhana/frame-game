"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUploader } from "@/components/avatar-uploader";

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  async function action(formData: FormData) {
    if (avatarUrl) formData.set("avatar_url", avatarUrl);
    setPending(true);
    const result = await updateProfile(formData);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.replace("/today");
    router.refresh();
  }

  return (
    <form action={action} className="space-y-5">
      <div className="flex items-center gap-4">
        <AvatarUploader userId={userId} value={avatarUrl} onChange={setAvatarUrl} />
        <div className="text-xs text-muted-foreground">
          Tap to upload a profile photo (optional).
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Username
        </label>
        <Input
          name="username"
          placeholder="your_handle"
          autoComplete="off"
          autoCapitalize="off"
          inputMode="text"
          pattern="[a-z0-9_]{3,24}"
          required
        />
        <p className="text-xs text-muted-foreground">
          3–24 characters. Lowercase letters, numbers, underscores.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Display name
        </label>
        <Input name="display_name" placeholder="First Last (optional)" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Bio
        </label>
        <Textarea name="bio" placeholder="Optional. Max 160 characters." maxLength={160} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Finish"}
      </Button>
    </form>
  );
}
