"use server";

import { revalidatePath } from "next/cache";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { requireUser } from "@/lib/user";

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();
  const updated = await markNotificationRead(notificationId, user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { ok: updated };
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  const count = await markAllNotificationsRead(user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { ok: true, count };
}
