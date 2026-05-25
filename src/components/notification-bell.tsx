import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasUnreadNotifications } from "@/lib/db/notifications";

export async function NotificationBell() {
  const hasUnread = await hasUnreadNotifications();

  return (
    <Link
      href="/notifications"
      aria-label={
        hasUnread ? "Notifications, unread items" : "Notifications"
      }
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        hasUnread && "text-foreground",
      )}
    >
      <Bell className="h-4 w-4" strokeWidth={2} />
      {hasUnread ? (
        <span
          className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
