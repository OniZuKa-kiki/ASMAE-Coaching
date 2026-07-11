"use client";

import { useEffect } from "react";
import { enabledLocalesCookieName } from "@/lib/locale-cookie";
import type { AppLocale } from "@/i18n/routing";

function readEnabledLocalesCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${enabledLocalesCookieName}=([^;]*)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function LocaleCookieSync({
  enabledLocales,
}: {
  enabledLocales: AppLocale[];
}) {
  useEffect(() => {
    const expected = enabledLocales.join(",");
    if (readEnabledLocalesCookie() === expected) return;

    void fetch("/api/locale/sync-enabled", { method: "POST" });
  }, [enabledLocales]);

  return null;
}
