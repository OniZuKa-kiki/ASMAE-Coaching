import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { locales, type AppLocale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import {
  defaultLocaleSettings,
  enabledLocalesCookieName,
  type LocaleSettings,
} from "@/lib/locale-cookie";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";

export {
  defaultLocaleSettings,
  enabledLocalesCookieName,
  isPublicLocaleSwitcherVisible,
  parseEnabledLocalesCookie,
  resolveAppLocale,
  type LocaleSettings,
} from "@/lib/locale-cookie";

export async function syncEnabledLocalesCookie(enabled: AppLocale[]): Promise<void> {
  // Route Handlers and Server Actions only — not Server Components (Next.js 16+).
  const jar = await cookies();
  const value = enabled.join(",");
  if (jar.get(enabledLocalesCookieName)?.value !== value) {
    jar.set(enabledLocalesCookieName, value, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}

export const getLocaleSettings = cache(async (): Promise<LocaleSettings> => {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
      select: { localeArEnabled: true, localeFrEnabled: true },
    });
    if (!row) return defaultLocaleSettings;
    return {
      ar: row.localeArEnabled,
      fr: row.localeFrEnabled,
    };
  } catch {
    return defaultLocaleSettings;
  }
});

export async function getEnabledLocales(): Promise<AppLocale[]> {
  const settings = await getLocaleSettings();
  const enabled = locales.filter((locale) =>
    locale === "ar" ? settings.ar : settings.fr
  );
  return enabled.length > 0 ? [...enabled] : ["ar"];
}
