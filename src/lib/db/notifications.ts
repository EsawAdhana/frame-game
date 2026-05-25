import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Notification,
  NotificationType,
  NotificationWithActor,
} from "@/lib/types";

type NotificationRow = Notification & {
  actor: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

function actorLabel(
  actor: NotificationRow["actor"],
): string {
  if (!actor) return "Someone";
  return actor.display_name ?? `@${actor.username}`;
}

function notificationHref(row: NotificationRow): string {
  switch (row.type as NotificationType) {
    case "new_prompt":
      return "/compose";
    case "friend_post":
    case "post_like":
    case "post_comment":
      return row.post_id ? `/post/${row.post_id}` : "/today";
    case "new_follower":
      return row.actor?.username ? `/u/${row.actor.username}` : "/today";
    default:
      return "/today";
  }
}

function notificationMessage(row: NotificationRow): string {
  const who = actorLabel(row.actor);
  switch (row.type as NotificationType) {
    case "new_prompt":
      return "Today's prompt is ready — post your photo.";
    case "friend_post":
      return `${who} posted for today's prompt.`;
    case "new_follower":
      return `${who} started following you.`;
    case "post_like":
      return `${who} liked your post.`;
    case "post_comment":
      return `${who} commented on your post.`;
    default:
      return "You have a new notification.";
  }
}

function shapeNotification(row: NotificationRow): NotificationWithActor {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type as NotificationType,
    actor_id: row.actor_id,
    post_id: row.post_id,
    prompt_id: row.prompt_id,
    read_at: row.read_at,
    created_at: row.created_at,
    actor: row.actor,
    href: notificationHref(row),
    message: notificationMessage(row),
  };
}

const NOTIFICATION_SELECT = `
  id, user_id, type, actor_id, post_id, prompt_id, read_at, created_at,
  actor:profiles!notifications_actor_id_fkey (
    id, username, display_name, avatar_url
  )
`;

export async function hasUnreadNotifications(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  if (error) return false;
  return (count ?? 0) > 0;
}

export async function listNotifications(
  limit = 80,
): Promise<NotificationWithActor[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as NotificationRow[]).map(shapeNotification);
}

export async function markNotificationRead(
  notificationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
