import Link from "next/link";
import { PromptHero } from "@/components/prompt-hero";
import { CollageGrid } from "@/components/collage-grid";
import { Button } from "@/components/ui/button";
import { getTodayPrompt } from "@/lib/db/prompts";
import { getRankedFeedForPrompt, hasPostedForPrompt } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const prompt = await getTodayPrompt();

  if (!prompt) {
    return (
      <main className="flex-1 px-5 py-6">
        <PromptHero text="New prompt loading…" />
        <p className="mt-6 text-sm text-muted-foreground">
          We couldn&apos;t fetch today&apos;s prompt. Check back in a minute.
        </p>
      </main>
    );
  }

  const [feed, hasPosted] = await Promise.all([
    getRankedFeedForPrompt(prompt.id),
    hasPostedForPrompt(prompt.id),
  ]);
  const totalPosts = feed.mine.length + feed.friends.length + feed.others.length;

  const dateLabel = new Date(`${prompt.active_date}T00:00:00Z`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", timeZone: "UTC" },
  );

  return (
    <main className="flex-1 px-5 py-6">
      <PromptHero text={prompt.text} date={dateLabel} />

      {!hasPosted ? (
        <div className="mt-5 rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-medium">Your turn</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Post your photo for today&apos;s prompt to unlock the full feed.
          </p>
          <Link href="/compose" className="mt-4 block">
            <Button size="lg" className="w-full">
              Post a photo
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {hasPosted ? "Today\u2019s collage" : `Peek (${totalPosts})`}
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalPosts} post{totalPosts === 1 ? "" : "s"}
          </span>
        </div>
        {hasPosted ? (
          <div className="space-y-6">
            {feed.mine.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your post
                </h3>
                <CollageGrid posts={feed.mine} avatarOpensProfile={false} />
              </section>
            )}
            {feed.friends.length > 0 && (
              <section className="border-t border-border pt-6">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Friends
                </h3>
                <CollageGrid posts={feed.friends} avatarOpensProfile={false} />
              </section>
            )}
            <section
              className={
                feed.mine.length > 0 || feed.friends.length > 0
                  ? "border-t border-border pt-6"
                  : ""
              }
            >
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Everyone
              </h3>
              <CollageGrid posts={feed.others} avatarOpensProfile={false} />
            </section>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            Post today&apos;s photo to reveal everyone else&apos;s.
          </div>
        )}
      </div>
    </main>
  );
}
