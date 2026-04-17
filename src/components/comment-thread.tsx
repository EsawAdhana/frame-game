"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addComment } from "@/app/actions/posts";
import { relativeTime } from "@/lib/utils";
import type { Comment } from "@/lib/types";

export function CommentThread({
  postId,
  comments,
  canComment,
}: {
  postId: string;
  comments: Comment[];
  canComment: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    const result = await addComment(postId, body);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar
                src={c.author.avatar_url}
                alt={c.author.display_name ?? c.author.username}
                size={32}
              />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    @{c.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm whitespace-pre-wrap break-words">
                  {c.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {canComment && (
        <form onSubmit={submit} className="flex gap-2 pt-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment…"
            maxLength={500}
            className="flex h-10 flex-1 rounded-full border border-input bg-card px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!body.trim() || pending}
          >
            Post
          </Button>
        </form>
      )}
    </div>
  );
}
