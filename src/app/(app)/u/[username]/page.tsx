import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { CollageGrid } from "@/components/collage-grid";
import { getProfileByUsername } from "@/lib/db/profiles";
import { getPostsByUsername } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const posts = await getPostsByUsername(username);

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
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Posts
          </div>
        </div>
      </section>

      {profile.bio && (
        <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {profile.bio}
        </p>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">
          History
        </h2>
        <CollageGrid posts={posts} />
      </div>
    </main>
  );
}
