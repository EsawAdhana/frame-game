import { redirect } from "next/navigation";
import { getTodayPrompt } from "@/lib/db/prompts";
import { hasPostedForPrompt } from "@/lib/db/posts";
import { getSessionUser } from "@/lib/supabase/server";
import { PromptHero } from "@/components/prompt-hero";
import { Composer } from "@/components/composer";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const prompt = await getTodayPrompt();
  if (!prompt) {
    return (
      <main className="flex-1 px-5 py-6">
        <p className="text-sm text-muted-foreground">
          No prompt available right now.
        </p>
      </main>
    );
  }

  if (await hasPostedForPrompt(prompt.id)) redirect("/today");

  return (
    <main className="flex-1 px-5 py-6">
      <PromptHero text={prompt.text} eyebrow="Respond to" />
      <div className="mt-6">
        <Composer userId={user.id} />
      </div>
    </main>
  );
}
