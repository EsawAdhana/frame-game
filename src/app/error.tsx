"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="text-xs text-muted-foreground">Error</p>
      <h1 className="font-serif text-2xl font-medium text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        {error.message || "Unexpected error. Try again."}
      </p>
      <Button size="lg" onClick={() => reset()}>
        Retry
      </Button>
    </main>
  );
}
