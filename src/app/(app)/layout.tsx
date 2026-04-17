import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.username || profile.username.startsWith("user_")) {
    redirect("/onboarding");
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link
          href="/today"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
          FrameGame
        </Link>
        <Link
          href={`/u/${profile.username}`}
          className="text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          @{profile.username}
        </Link>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <BottomNav />
    </>
  );
}
