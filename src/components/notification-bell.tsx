import { hasNotificationBellBadge } from "@/lib/db/notifications";
import { NotificationBellButton } from "@/components/notification-bell-button";

export async function NotificationBell() {
  const showBadge = await hasNotificationBellBadge();
  return <NotificationBellButton initialShowBadge={showBadge} />;
}
