import "server-only";

import { getRequestLocale } from "@/lib/request-locale";
import type { ActionLocale } from "@/lib/action-result";
import {
  getFriendlyErrors,
  type ErrorLocale,
} from "@/lib/api-errors";

export async function getActionLocale(
  preferredLocale?: string | null
): Promise<ActionLocale> {
  if (preferredLocale === "fr" || preferredLocale === "ar") {
    return preferredLocale;
  }
  const locale = await getRequestLocale();
  return locale === "fr" ? "fr" : "ar";
}

export async function getRequestFriendlyErrors() {
  const locale = await getActionLocale();
  return getFriendlyErrors(locale as ErrorLocale);
}
