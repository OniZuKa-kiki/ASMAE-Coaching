import { locales, type AppLocale } from "@/i18n/routing";

export type LocaleSettings = {
  ar: boolean;
  fr: boolean;
};

export const defaultLocaleSettings: LocaleSettings = {
  ar: true,
  fr: false,
};

export const enabledLocalesCookieName = "SITE_ENABLED_LOCALES";

export function parseEnabledLocalesCookie(
  value: string | undefined
): AppLocale[] | null {
  if (!value) return null;
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is AppLocale =>
      locales.includes(item as AppLocale)
    );
  return parsed.length > 0 ? parsed : null;
}

export function resolveAppLocale(
  requested: string | null | undefined,
  enabled: AppLocale[]
): AppLocale {
  const fallback = enabled.includes("ar") ? "ar" : (enabled[0] ?? "ar");
  if (requested === "fr" && enabled.includes("fr")) return "fr";
  if (requested === "ar" && enabled.includes("ar")) return "ar";
  return fallback;
}

export function isPublicLocaleSwitcherVisible(settings: LocaleSettings): boolean {
  return Number(settings.ar) + Number(settings.fr) > 1;
}
