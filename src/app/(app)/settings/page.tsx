import { getSessionProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/sign-in");

  return (
    <main className="flex-1 px-5 py-6">
      <h1 className="font-serif text-2xl font-medium text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update how you show up on FrameGame.
      </p>
      <div className="mt-6">
        <SettingsForm profile={profile} />
      </div>
      <div className="mt-10 border-t border-border pt-6">
        <SignOutButton />
      </div>
    </main>
  );
}
