"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { reportPost } from "@/app/actions/posts";

export function ReportButton({ postId }: { postId: string }) {
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    const reason = prompt("Why are you reporting this post? (optional)") ?? "";
    if (reason === null) return;
    startTransition(async () => {
      const result = await reportPost(postId, reason);
      if (!result.ok) toast.error(result.error);
      else toast.success("Reported. An admin will review it.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
    >
      <Flag className="h-3.5 w-3.5" /> Report
    </button>
  );
}
