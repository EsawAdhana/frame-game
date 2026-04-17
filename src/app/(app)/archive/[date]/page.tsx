import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PromptHero } from "@/components/prompt-hero";
import { CollageGrid } from "@/components/collage-grid";
import { getPromptByDate } from "@/lib/db/prompts";
import { getFeedForPrompt } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

export default async function ArchiveDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const prompt = await getPromptByDate(date);
  if (!prompt) notFound();
  const posts = await getFeedForPrompt(prompt.id);

  const dateLabel = new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="flex-1 px-5 py-6">
      <Link
        href="/archive"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Archive
      </Link>
      <div className="mt-4">
        <PromptHero text={prompt.text} date={dateLabel} eyebrow="Prompt on" />
      </div>
      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Collage</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </span>
        </div>
        <CollageGrid posts={posts} />
      </div>
    </main>
  );
}
