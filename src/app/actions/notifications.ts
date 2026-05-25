"use server";

import { revalidatePath } from "next/cache";
import {
  markNotificationRead as markReadInDb,
  markNotificationsInboxSeen as markInboxSeenInDb,
} from "@/lib/db/notifications";

function revalidateAppShell() {
  revalidatePath("/notifications");
  revalidatePath("/today", "layout");
  revalidatePath("/compose", "layout");
  revalidatePath("/archive", "layout");
  revalidatePath("/settings", "layout");
}

export async function markNotificationsInboxSeen() {
  const result = await markInboxSeenInDb();
  if (result.ok) revalidateAppShell();
  return result;
}

export async function markNotificationRead(notificationId: string) {
  const result = await markReadInDb(notificationId);
  if (result.ok) revalidateAppShell();
  return result;
}
