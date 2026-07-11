"use server";

import { revalidatePath } from "next/cache";
import { getActionLocale } from "@/lib/action-locale";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/db";
import {
  getTodayCheckInDate,
  parseMoodCheckInInput,
} from "@/lib/mood-check-in";
import { requireUser } from "@/lib/user";

export async function saveMoodCheckIn(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const locale = await getActionLocale(user.preferredLocale);
  const moodRaw = String(formData.get("mood") || "").trim();
  const noteRaw = String(formData.get("note") || "").trim();

  if (!moodRaw) return incomplete(locale);

  return runAction(locale, async () => {
    const { mood, note } = parseMoodCheckInInput(moodRaw, noteRaw);

    await prisma.moodCheckIn.upsert({
      where: {
        userId_checkInDate: {
          userId: user.id,
          checkInDate: getTodayCheckInDate(),
        },
      },
      create: {
        userId: user.id,
        checkInDate: getTodayCheckInDate(),
        mood,
        note,
      },
      update: { mood, note },
    });

    revalidatePath("/dashboard");
  }, "updated");
}
