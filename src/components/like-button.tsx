"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleLike } from "@/app/actions/posts";
import { cn } from "@/lib/utils";

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  className,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  className?: string;
}) {
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    startTransition(async () => {
      const result = await toggleLike(postId);
      if (!result.ok) {
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
        liked ? "text-destructive" : "text-foreground",
        className,
      )}
      aria-pressed={liked}
    >
      <Heart
        className={cn("h-5 w-5", liked && "fill-current")}
        strokeWidth={2}
      />
      <span>{count}</span>
    </button>
  );
}
