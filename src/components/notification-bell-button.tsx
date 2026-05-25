"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { markNotificationsInboxSeen } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationBellButton({
  initialShowBadge,
}: {
  initialShowBadge: boolean;
}) {
  const router = useRouter();
  const [showBadge, setShowBadge] = useState(initialShowBadge);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setShowBadge(initialShowBadge);
  }, [initialShowBadge]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    startTransition(async () => {
      if (showBadge) {
        setShowBadge(false);
        await markNotificationsInboxSeen();
      }
      router.push("/notifications");
    });
  }

  return (
    <Link
      href="/notifications"
      onClick={handleClick}
      aria-label={
        showBadge ? "Notifications, new items" : "Notifications"
      }
      aria-busy={pending}
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        showBadge && "text-foreground",
        pending && "opacity-80",
      )}
    >
      <Bell className="h-4 w-4" strokeWidth={2} />
      {showBadge ? (
        <span
          className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
