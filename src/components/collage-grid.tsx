import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import type { PostWithAuthor } from "@/lib/types";

export function CollageGrid({
  posts,
  avatarOpensProfile = true,
}: {
  posts: PostWithAuthor[];
  /**
   * When true, the avatar/username strip links to the author's profile and
   * the image links to the post. When false, the entire tile links to the
   * post (used on /today where the grid is the primary post entry point).
   */
  avatarOpensProfile?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No submissions yet. Be the first.
      </div>
    );
  }

  if (!avatarOpensProfile) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/post/${p.id}`}
            className="group relative block overflow-hidden rounded-2xl bg-muted"
          >
            <div className="aspect-square w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={p.caption ?? `Post by @${p.author.username}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white">
              <Avatar
                src={p.author.avatar_url}
                alt={p.author.display_name ?? p.author.username}
                size={20}
              />
              <span className="truncate font-medium">@{p.author.username}</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.map((p) => (
        <div
          key={p.id}
          className="group relative overflow-hidden rounded-2xl bg-muted"
        >
          <Link
            href={`/post/${p.id}`}
            className="block"
            aria-label={p.caption ?? `Post by @${p.author.username}`}
          >
            <div className="aspect-square w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={p.caption ?? `Post by @${p.author.username}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </Link>
          <Link
            href={`/u/${p.author.username}`}
            className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-white"
          >
            <Avatar
              src={p.author.avatar_url}
              alt={p.author.display_name ?? p.author.username}
              size={20}
            />
            <span className="truncate font-medium">@{p.author.username}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
