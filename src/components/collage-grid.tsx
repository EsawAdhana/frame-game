"use client";

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PostWithAuthor } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOCKED_MESSAGE =
  "Post today's photo to reveal everyone else's.";

export function CollageGrid({
  posts,
  avatarOpensProfile = true,
  locked = false,
}: {
  posts: PostWithAuthor[];
  /**
   * When true, the avatar/username strip links to the author's profile and
   * the image links to the post. When false, the entire tile links to the
   * post (used on /today where the grid is the primary post entry point).
   */
  avatarOpensProfile?: boolean;
  /** Blur tiles and show a lock; taps open a prompt instead of the post. */
  locked?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No submissions yet. Be the first.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {posts.map((p) => (
          <PostTile
            key={p.id}
            post={p}
            avatarOpensProfile={avatarOpensProfile}
            locked={locked}
            onLockedClick={() => setDialogOpen(true)}
          />
        ))}
      </div>
      {dialogOpen ? (
        <LockedFeedDialog onClose={() => setDialogOpen(false)} />
      ) : null}
    </>
  );
}

function LockedFeedDialog({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="locked-feed-title"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="locked-feed-title"
          className="text-center text-sm font-medium leading-snug text-foreground"
        >
          {LOCKED_MESSAGE}
        </h2>
        <Button
          type="button"
          size="lg"
          className="mt-5 w-full"
          onClick={onClose}
        >
          OK
        </Button>
      </div>
    </div>
  );
}

function PostTile({
  post,
  avatarOpensProfile,
  locked,
  onLockedClick,
}: {
  post: PostWithAuthor;
  avatarOpensProfile: boolean;
  locked: boolean;
  onLockedClick: () => void;
}) {
  const authorStrip = (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white">
      <Avatar
        src={post.author.avatar_url}
        alt={post.author.display_name ?? post.author.username}
        size={20}
      />
      <span className="truncate font-medium">@{post.author.username}</span>
    </div>
  );

  const image = (
    <div className="aspect-square w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.image_url}
        alt={post.caption ?? `Post by @${post.author.username}`}
        className={cn(
          "h-full w-full object-cover transition-transform duration-300",
          !locked && "group-hover:scale-[1.02]",
          locked && "scale-105 blur-xl",
        )}
        loading="lazy"
      />
    </div>
  );

  if (locked) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className="group relative block w-full overflow-hidden rounded-2xl bg-muted text-left"
        aria-label={`Locked post by @${post.author.username}`}
      >
        {image}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25"
          aria-hidden
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
            <Lock className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
        {authorStrip}
      </button>
    );
  }

  if (!avatarOpensProfile) {
    return (
      <Link
        href={`/post/${post.id}`}
        className="group relative block overflow-hidden rounded-2xl bg-muted"
      >
        {image}
        {authorStrip}
      </Link>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-muted">
      <Link
        href={`/post/${post.id}`}
        className="block"
        aria-label={post.caption ?? `Post by @${post.author.username}`}
      >
        {image}
      </Link>
      <Link
        href={`/u/${post.author.username}`}
        className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white"
      >
        <Avatar
          src={post.author.avatar_url}
          alt={post.author.display_name ?? post.author.username}
          size={20}
        />
        <span className="truncate font-medium">@{post.author.username}</span>
      </Link>
    </div>
  );
}
