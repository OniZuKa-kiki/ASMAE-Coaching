"use server";

import { revalidatePath } from "next/cache";
import { adminUrl } from "@/lib/admin-path";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getActionLocale } from "@/lib/action-locale";
import { getFriendlyErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/db";
import { getSiteSettings, SITE_SETTINGS_ID } from "@/lib/site-settings";
import {
  getEnabledLocales,
  syncEnabledLocalesCookie,
} from "@/lib/locale-settings";

export async function updateLocaleSettings(formData: FormData): Promise<ActionResult> {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const arEnabled = formData.get("localeArEnabled") === "on";
  const frEnabled = formData.get("localeFrEnabled") === "on";

  if (!arEnabled && !frEnabled) {
    return {
      ok: false,
      error: getFriendlyErrors(locale).localeRequired,
    };
  }

  return runAction(locale, async () => {
    const existing = await getSiteSettings();
    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: {
        id: SITE_SETTINGS_ID,
        contactEmail: existing.contactEmail,
        contactPhone: existing.contactPhone,
        coachEmail: existing.coachEmail,
        whatsappUrl: existing.whatsappUrl,
        instagramUrl: existing.instagramUrl,
        instagramHandle: existing.instagramHandle,
        localeArEnabled: arEnabled,
        localeFrEnabled: frEnabled,
      },
      update: {
        localeArEnabled: arEnabled,
        localeFrEnabled: frEnabled,
      },
    });

    const enabled = await getEnabledLocales();
    await syncEnabledLocalesCookie(enabled);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(adminUrl());
    revalidatePath(adminUrl("/settings/languages"));
  }, "updated");
}
