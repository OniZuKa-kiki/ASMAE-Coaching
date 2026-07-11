import { routing, type AppLocale } from "@/i18n/routing";
import type { EmailLang } from "@/lib/email-copy";
import { prisma } from "@/lib/db";

export function toEmailLang(locale: string | null | undefined): EmailLang {
  return locale === "fr" ? "fr" : "ar";
}

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && routing.locales.includes(value as AppLocale));
}

export async function getEmailLangForAddress(
  email: string | null | undefined
): Promise<EmailLang> {
  if (!email) return "ar";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { preferredLocale: true },
    });
    return toEmailLang(user?.preferredLocale);
  } catch {
    return "ar";
  }
}
