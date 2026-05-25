"use server";

import { revalidatePath } from "next/cache";
import { markNotificationRead as markReadInDb } from "@/lib/db/notifications";

export async function markNotificationRead(notificationId: string) {
  const result = await markReadInDb(notificationId);
  if (result.ok) {
    revalidatePath("/notifications");
    revalidatePath("/today", "layout");
    revalidatePath("/compose", "layout");
    revalidatePath("/archive", "layout");
    revalidatePath("/settings", "layout");
  }
  return result;
}
