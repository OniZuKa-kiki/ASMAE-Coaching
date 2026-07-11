import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "fr"] as const;
export type AppLocale = (typeof locales)[number];

export const localeCookieName = "NEXT_LOCALE";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "ar",
  localePrefix: "never",
  localeCookie: {
    name: localeCookieName,
    maxAge: localeCookieMaxAge,
  },
});
