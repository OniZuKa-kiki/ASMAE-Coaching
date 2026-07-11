import { ar, fr } from "date-fns/locale";
import type { AppLocale } from "@/i18n/routing";

export const siteLocale = "ar" as const;
export const dateFnsLocale = ar;

export function intlLocale(locale: AppLocale): string {
  return locale === "fr" ? "fr-FR" : "ar-MA";
}

export function dateFnsLocaleFor(locale: AppLocale) {
  return locale === "fr" ? fr : ar;
}
