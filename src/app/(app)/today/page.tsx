import Link from "next/link";
import { formatPromptDate } from "@/lib/utils";
import { PromptHero } from "@/components/prompt-hero";
import { CollageGrid } from "@/components/collage-grid";
import { Button } from "@/components/ui/button";
import { getTodayPrompt } from "@/lib/db/prompts";
import { getRankedFeedForPrompt, hasPostedForPrompt } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

function TodayFeedSections({
  feed,
  locked,
}: {
  feed: Awaited<ReturnType<typeof getRankedFeedForPrompt>>;
  locked: boolean;
}) {
  return (
    <div className="space-y-6">
      {feed.mine.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your post
          </h3>
          <CollageGrid
            posts={feed.mine}
            avatarOpensProfile={false}
            locked={locked}
          />
        </section>
      )}
      {feed.friends.length > 0 && (
        <section
          className={feed.mine.length > 0 ? "border-t border-border pt-6" : ""}
        >
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Friends
          </h3>
          <CollageGrid
            posts={feed.friends}
            avatarOpensProfile={false}
            locked={locked}
          />
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
        <CollageGrid
          posts={feed.others}
          avatarOpensProfile={false}
          locked={locked}
        />
      </section>
    </div>
  );
}

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

  const dateLabel = formatPromptDate(prompt.active_date);

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
            Today&apos;s collage
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalPosts} post{totalPosts === 1 ? "" : "s"}
          </span>
        </div>
        <TodayFeedSections feed={feed} locked={!hasPosted} />
      </div>
    </main>
  );
}
