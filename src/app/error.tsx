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
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Error
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
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
