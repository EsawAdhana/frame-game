import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { CollageGrid } from "@/components/collage-grid";
import { FollowButton } from "@/components/follow-button";
import { getProfileByUsername } from "@/lib/db/profiles";
import { getPostsByUsername, getTaggedPostsByUsername } from "@/lib/db/posts";
import { isFollowing } from "@/lib/db/follows";
import { getSessionUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "tagged" ? "tagged" : "posts";

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [posts, taggedPosts, viewer] = await Promise.all([
    getPostsByUsername(username),
    getTaggedPostsByUsername(username),
    getSessionUser(),
  ]);
  const isMe = viewer?.id === profile.id;
  const viewerFollows =
    viewer && !isMe ? await isFollowing(viewer.id, profile.id) : false;

  return (
    <main className="flex-1 px-5 py-6">
      <section className="flex items-center gap-4">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name ?? profile.username}
          size={72}
        />
        <div className="flex-1">
          <div className="text-lg font-semibold">
            {profile.display_name ?? `@${profile.username}`}
          </div>
          <div className="text-sm text-muted-foreground">@{profile.username}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">{posts.length}</div>
          <div className="text-xs text-muted-foreground">Posts</div>
        </div>
      </section>

      {isMe ? (
        <div className="mt-4">
          <Link
            href="/settings"
            className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Edit profile
          </Link>
        </div>
      ) : viewer && (
        <div className="mt-4">
          <FollowButton
            targetUserId={profile.id}
            initialFollowing={viewerFollows}
          />
        </div>
      )}

      {profile.bio && (
        <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {profile.bio}
        </p>
      )}

      <div className="mt-6">
        <div className="flex border-b border-border">
          <Link
            href={`/u/${profile.username}`}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "posts"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Posts
          </Link>
          <Link
            href={`/u/${profile.username}?tab=tagged`}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "tagged"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Tagged
          </Link>
        </div>

        <div className="mt-4">
          {activeTab === "posts" ? (
            <CollageGrid posts={posts} fromHref={`/u/${username}`} />
          ) : (
            taggedPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
                No tagged posts yet.
              </div>
            ) : (
              <CollageGrid posts={taggedPosts} avatarOpensProfile fromHref={`/u/${username}`} />
            )
          )}
        </div>
      </div>
    </main>
  );
}
