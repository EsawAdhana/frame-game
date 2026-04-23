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
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/85 px-5 py-3 backdrop-blur-sm pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Link
          href="/today"
          className="text-sm font-medium text-foreground"
        >
          FrameGame
        </Link>
        <Link
          href={`/u/${profile.username}`}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          @{profile.username}
        </Link>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <BottomNav />
    </>
  );
}
