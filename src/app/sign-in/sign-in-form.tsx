"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn, signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup";

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [pending, setPending] = React.useState(false);

  async function action(formData: FormData) {
    setPending(true);
    const result =
      mode === "signin" ? await signIn(formData) : await signUp(formData);
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.replace(result.needsOnboarding ? "/onboarding" : "/today");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-5 inline-flex rounded-full border border-border bg-card p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "signin"
              ? "bg-foreground text-background"
              : "text-muted-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === "signup"
              ? "bg-foreground text-background"
              : "text-muted-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <form action={action} className="space-y-3">
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
          required
        />
        <Input
          name="password"
          type="password"
          placeholder={
            mode === "signup"
              ? "Choose a password (8+ characters)"
              : "Password"
          }
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={8}
          required
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending
            ? mode === "signup"
              ? "Creating account\u2026"
              : "Signing in\u2026"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        {mode === "signup"
          ? "We&apos;ll never email you. Pick any password &mdash; it&apos;s just for this class beta."
              .replace(/&apos;/g, "\u2019")
              .replace(/&mdash;/g, "\u2014")
          : "No account? Tap \u201cCreate account\u201d above."}
      </p>
    </div>
  );
}
