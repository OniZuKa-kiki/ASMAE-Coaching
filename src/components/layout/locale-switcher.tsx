"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEnabledLocales } from "@/components/layout/locale-settings-provider";
import {
  routing,
  type AppLocale,
  localeCookieMaxAge,
  localeCookieName,
} from "@/i18n/routing";

type LocaleSwitcherProps = {
  className?: string;
  variant?: "default" | "onDark";
  compact?: boolean;
  fullWidth?: boolean;
};

export function LocaleSwitcher({
  className,
  variant = "default",
  compact = false,
  fullWidth = false,
}: LocaleSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const enabledLocales = useEnabledLocales();
  const router = useRouter();
  const t = useTranslations("locale");

  if (enabledLocales.length <= 1) {
    return null;
  }

  function switchLocale(next: AppLocale) {
    if (next === locale || !enabledLocales.includes(next)) return;
    document.cookie = `${localeCookieName}=${next};path=/;max-age=${localeCookieMaxAge};SameSite=Lax`;
    router.refresh();
  }

  function labelFor(code: AppLocale) {
    if (compact) {
      return t(`${code}Short` as "arShort" | "frShort");
    }
    return t(code);
  }

  const isOnDark = variant === "onDark";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-semibold",
        fullWidth && "flex w-full",
        isOnDark
          ? "border-white/25 bg-white/10"
          : "border-border/70 bg-card",
        className
      )}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((code) => {
        if (!enabledLocales.includes(code)) return null;

        const isActive = locale === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors whitespace-nowrap",
              fullWidth && "flex-1 text-center",
              isActive
                ? isOnDark
                  ? "bg-white text-heading shadow-sm"
                  : "bg-primary text-white"
                : isOnDark
                  ? "text-white/75 hover:bg-white/10 hover:text-white"
                  : "text-text/70 hover:text-heading"
            )}
          >
            {labelFor(code)}
          </button>
        );
      })}
    </div>
  );
}
