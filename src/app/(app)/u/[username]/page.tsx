import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { CollageGrid } from "@/components/collage-grid";
import { FollowButton } from "@/components/follow-button";
import { getProfileByUsername } from "@/lib/db/profiles";
import { getPostsByUsername } from "@/lib/db/posts";
import { isFollowing } from "@/lib/db/follows";
import { getSessionUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [posts, viewer] = await Promise.all([
    getPostsByUsername(username),
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
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          History
        </h2>
        <CollageGrid posts={posts} fromHref={`/u/${username}`} />
      </div>
    </main>
  );
}
