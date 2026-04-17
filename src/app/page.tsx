import Link from "next/link";
import { redirect } from "next/navigation";
import { getTodayPrompt } from "@/lib/db/prompts";
import { getSessionUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect("/today");

  const prompt = await getTodayPrompt();

  return (
    <main className="flex flex-1 flex-col justify-between px-6 pt-24 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
          FrameGame
        </div>
        <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight">
          One prompt a day.
          <br />
          <span className="text-muted-foreground">Everyone&apos;s frame.</span>
        </h1>
        <p className="mt-4 max-w-sm text-base text-muted-foreground">
          No time windows. No filters. Just a shared prompt, one photo each,
          and a collage that only exists for today.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today&apos;s prompt
          </div>
          <div className="mt-2 text-xl font-medium leading-snug">
            {prompt?.text ?? "New prompt loading\u2026"}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <Link href="/sign-in" className="block">
          <Button size="lg" className="w-full">
            Get started
          </Button>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Magic-link sign-in. No passwords.
        </p>
      </div>
    </main>
  );
}
