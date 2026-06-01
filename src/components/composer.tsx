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

type TagSuggestion = {
  id: string;
  username: string;
  display_name: string | null;
};

export function Composer({ userId }: { userId: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const tagInputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [caption, setCaption] = React.useState("");

  const [tagQuery, setTagQuery] = React.useState("");
  const [tagSuggestions, setTagSuggestions] = React.useState<TagSuggestion[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<TagSuggestion[]>([]);
  const [showTagDropdown, setShowTagDropdown] = React.useState(false);

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

  // Search profiles as user types in tag input
  React.useEffect(() => {
    const q = (tagQuery.startsWith("@") ? tagQuery.slice(1) : tagQuery).trim();
    if (!q) {
      setTagSuggestions([]);
      setShowTagDropdown(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .ilike("username", `${q}%`)
        .neq("id", userId)
        .limit(5);
      if (cancelled) return;
      const filtered = (data ?? []).filter(
        (p) => !selectedTags.some((t) => t.id === p.id),
      );
      setTagSuggestions(filtered);
      setShowTagDropdown(filtered.length > 0);
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tagQuery, userId, selectedTags]);

  function selectTag(tag: TagSuggestion) {
    setSelectedTags((prev) => [...prev, tag]);
    setTagQuery("");
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  }

  function removeTag(id: string) {
    setSelectedTags((prev) => prev.filter((t) => t.id !== id));
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
      fd.set("tagged_user_ids", JSON.stringify(selectedTags.map((t) => t.id)));
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

      {/* Tag people */}
      <div className="relative">
        {selectedTags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selectedTags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
              >
                @{t.username}
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  aria-label={`Remove @${t.username}`}
                  className="ml-0.5 rounded-full hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={tagInputRef}
          type="text"
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
          onFocus={() => {
            if (tagSuggestions.length > 0) setShowTagDropdown(true);
          }}
          placeholder="Tag people (@username)…"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {showTagDropdown && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            {tagSuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => selectTag(s)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent"
              >
                <span className="font-medium">@{s.username}</span>
                {s.display_name && (
                  <span className="text-muted-foreground">{s.display_name}</span>
                )}
              </button>
            ))}
          </div>
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
