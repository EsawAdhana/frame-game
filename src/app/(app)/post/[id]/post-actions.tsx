"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/app/actions/posts";

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function onDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deletePost(postId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Deleted");
      router.replace("/today");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" /> Delete
    </button>
  );
}
