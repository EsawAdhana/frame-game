"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function AvatarUploader({
  userId,
  value,
  onChange,
  size = 72,
}: {
  userId: string;
  value: string;
  onChange: (url: string) => void;
  size?: number;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const supabase = createClient();
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange(publicUrl);
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative rounded-full"
      disabled={uploading}
    >
      <Avatar src={value || null} alt="You" size={size} />
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-border/60" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePick}
      />
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white">
          …
        </span>
      )}
    </button>
  );
}
