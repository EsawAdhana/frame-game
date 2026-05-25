import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NotificationList } from "@/components/notification-list";
import { listNotifications } from "@/lib/db/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await listNotifications();

  return (
    <main className="flex-1 px-5 py-6">
      <Link
        href="/today"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-medium text-foreground">
        Notifications
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Newest first. Tap to open.
      </p>
      <div className="mt-6">
        <NotificationList notifications={notifications} />
      </div>
    </main>
  );
}
