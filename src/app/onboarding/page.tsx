import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/sign-in");

  const isPlaceholder =
    !profile.username || profile.username.startsWith("user_");
  if (!isPlaceholder) redirect("/today");

  return (
    <main className="flex flex-1 flex-col px-6 pt-16 pb-12">
      <div>
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Pick your handle
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is how friends will find you. You can change the rest later in
          Settings.
        </p>
      </div>
      <div className="mt-8">
        <OnboardingForm userId={profile.id} />
      </div>
    </main>
  );
}
