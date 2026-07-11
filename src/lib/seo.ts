import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import type { AppLocale } from "@/i18n/routing";

const baseUrl = siteConfig.url.replace(/\/$/, "");

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/** hreflang alternates — FR via ?lang=fr (cookie set in middleware). */
export function localeAlternates(pathname: string): Metadata["alternates"] {
  const path = normalizePath(pathname);
  const arUrl = `${baseUrl}${path || "/"}`;
  const frUrl = `${baseUrl}${path || "/"}?lang=fr`;

  return {
    canonical: arUrl,
    languages: {
      ar: arUrl,
      fr: frUrl,
      "x-default": arUrl,
    },
  };
}

export function openGraphLocale(locale: AppLocale): string {
  return locale === "fr" ? "fr_FR" : "ar_MA";
}
