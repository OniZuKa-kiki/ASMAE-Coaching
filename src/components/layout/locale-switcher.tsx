"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
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
  showLabel?: boolean;
};

const pillSpring = { type: "spring" as const, stiffness: 420, damping: 34 };

export function LocaleSwitcher({
  className,
  variant = "default",
  compact = false,
  fullWidth = false,
  showLabel,
}: LocaleSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const enabledLocales = useEnabledLocales();
  const router = useRouter();
  const t = useTranslations("locale");
  const [switching, setSwitching] = useState(false);

  const visibleLocales = routing.locales.filter((code) =>
    enabledLocales.includes(code)
  );

  useEffect(() => {
    setSwitching(false);
  }, [locale]);

  if (enabledLocales.length <= 1) {
    return null;
  }

  function switchLocale(next: AppLocale) {
    if (next === locale || !enabledLocales.includes(next) || switching) return;
    setSwitching(true);
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
  const displayLabel = showLabel ?? fullWidth;
  const layoutId = isOnDark ? "locale-switcher-pill-dark" : "locale-switcher-pill";

  if (fullWidth) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        {displayLabel ? (
          <div
            className={cn(
              "flex items-center gap-1.5 px-0.5",
              isOnDark ? "text-white/55" : "text-text/55"
            )}
          >
            <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-xs font-medium">{t("label")}</span>
          </div>
        ) : null}

        <div
          className={cn(
            "relative grid gap-1 rounded-2xl border p-1 transition-opacity",
            visibleLocales.length === 2 ? "grid-cols-2" : "grid-cols-1",
            switching && "pointer-events-none opacity-70",
            isOnDark
              ? "border-white/15 bg-white/10"
              : "border-border/60 bg-primary/[0.06]"
          )}
          style={
            visibleLocales.length > 2
              ? { gridTemplateColumns: `repeat(${visibleLocales.length}, minmax(0, 1fr))` }
              : undefined
          }
          role="group"
          aria-label={t("label")}
        >
          {visibleLocales.map((code) => {
            const isActive = locale === code;

            return (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                aria-pressed={isActive}
                className={cn(
                  "relative z-10 flex min-h-11 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? isOnDark
                      ? "text-heading"
                      : "text-white"
                    : isOnDark
                      ? "text-white/70 hover:text-white"
                      : "text-text/65 hover:text-heading"
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId={layoutId}
                    className={cn(
                      "absolute inset-0 rounded-xl shadow-sm",
                      isOnDark ? "bg-white" : "bg-primary"
                    )}
                    transition={pillSpring}
                  />
                ) : null}
                <span className="relative z-10 whitespace-nowrap">{labelFor(code)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 text-xs font-semibold",
        isOnDark
          ? "border-white/25 bg-white/10"
          : "border-border/70 bg-card",
        switching && "pointer-events-none opacity-70",
        className
      )}
      role="group"
      aria-label={t("label")}
    >
      {visibleLocales.map((code) => {
        const isActive = locale === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors whitespace-nowrap",
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
