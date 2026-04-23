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
        <p className="text-xs text-muted-foreground">FrameGame</p>
        <h1 className="mt-6 font-serif text-4xl font-medium leading-[1.12] text-foreground">
          One prompt a day.
          <br />
          <span className="text-muted-foreground">Everyone&apos;s frame.</span>
        </h1>
        <p className="mt-4 max-w-sm text-base text-muted-foreground">
          No time windows. No filters. Just a shared prompt, one photo each,
          and a collage that only exists for today.
        </p>

        <div className="mt-10 rounded-2xl border border-border/80 bg-card p-5 shadow-[0_1px_2px_rgba(68,64,60,0.06)]">
          <div className="text-xs text-muted-foreground">Today&apos;s prompt</div>
          <p className="mt-2 font-serif text-xl font-medium leading-snug text-foreground">
            {prompt?.text ?? "New prompt loading\u2026"}
          </p>
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
