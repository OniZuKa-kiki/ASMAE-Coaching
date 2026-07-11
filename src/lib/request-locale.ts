import "server-only";

import { cookies } from "next/headers";
import { localeCookieName, routing, type AppLocale } from "@/i18n/routing";
import type { EmailLang } from "@/lib/email-copy";
import { toEmailLang } from "@/lib/user-locale";

export async function getRequestLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  if (value && routing.locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return routing.defaultLocale;
}

export async function resolveEmailLang(
  preferredLocale?: string | null
): Promise<EmailLang> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(localeCookieName)?.value;
    if (value && routing.locales.includes(value as AppLocale)) {
      return toEmailLang(value);
    }
  } catch {
    // webhook / cron — pas de requête HTTP
  }
  return toEmailLang(preferredLocale);
}
