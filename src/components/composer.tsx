"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/app/actions/posts";
import { createClient } from "@/lib/supabase/client";

export function Composer({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [caption, setCaption] = React.useState("");

  const previewUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  React.useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
  }

  async function submit() {
    if (!file) {
      toast.error("Pick a photo first.");
      return;
    }
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const supabase = createClient();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, compressed, { contentType: "image/jpeg", upsert: false });
      if (uploadError) throw uploadError;

      const fd = new FormData();
      fd.set("image_path", path);
      fd.set("caption", caption);
      const result = await createPost(fd);
      if (!result.ok) {
        await supabase.storage.from("posts").remove([path]);
        throw new Error(result.error);
      }
      toast.success("Posted");
      router.replace("/today");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:bg-accent"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm font-medium">Tap to take a photo</span>
          <span className="text-xs text-muted-foreground">or pick from library</span>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" className="w-full" />
          <button
            type="button"
            onClick={() => setFile(null)}
            className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePick}
      />

      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption (optional)…"
        maxLength={280}
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{caption.length}/280</span>
        {file && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="underline underline-offset-4"
          >
            Replace photo
          </button>
        )}
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={submit}
        disabled={!file || uploading}
      >
        {uploading ? "Posting…" : "Post"}
      </Button>
    </div>
  );
}
