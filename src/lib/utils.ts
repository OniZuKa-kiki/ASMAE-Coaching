import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppLocale } from "@/i18n/routing";
import { intlLocale, siteLocale } from "@/lib/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Date Prisma ou chaîne ISO (après unstable_cache). */
export function toIsoString(
  value: Date | string | null | undefined
): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function formatPrice(
  cents: number,
  currency = "EUR",
  locale?: string
): string {
  return new Intl.NumberFormat(locale ?? siteLocale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(
  date: Date | string,
  locale?: AppLocale | string
): string {
  const resolved =
    typeof locale === "string" && locale.includes("-")
      ? locale
      : intlLocale((locale as AppLocale | undefined) ?? "ar");
  return new Intl.DateTimeFormat(resolved, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const userRoleLabels: Record<string, string> = {
  ADMIN: "مدير النظام",
  COACH: "المدربة",
  CLIENT: "العميل",
};

export function formatUserRole(role: string): string {
  return userRoleLabels[role] ?? role;
}
