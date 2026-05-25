"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { markNotificationRead } from "@/app/actions/notifications";
import { relativeTime } from "@/lib/utils";
import type { NotificationWithActor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationList({
  notifications,
}: {
  notifications: NotificationWithActor[];
}) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        No notifications yet.
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card divide-y divide-border">
      {notifications.map((n) => (
        <NotificationRow key={n.id} notification={n} />
      ))}
    </ul>
  );
}

function NotificationRow({ notification }: { notification: NotificationWithActor }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unread = !notification.read_at;

  function open() {
    startTransition(async () => {
      if (unread) await markNotificationRead(notification.id);
      router.push(notification.href);
    });
  }

  return (
    <li>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent disabled:opacity-60"
      >
        <span
          className={cn(
            "mt-2 h-2 w-2 shrink-0 rounded-full",
            unread ? "bg-white ring-1 ring-border" : "bg-transparent",
          )}
          aria-hidden
        />
        {notification.actor ? (
          <Avatar
            src={notification.actor.avatar_url}
            alt={
              notification.actor.display_name ?? notification.actor.username
            }
            size={40}
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            FG
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-foreground">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {relativeTime(notification.created_at)}
          </p>
        </div>
      </button>
    </li>
  );
}
