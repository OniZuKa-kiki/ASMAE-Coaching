"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type TurnstileSize = "normal" | "compact" | "flexible";
type TurnstileTheme = "light" | "dark" | "auto";
type TurnstileAppearance = "always" | "execute" | "interaction-only";

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  className?: string;
  size?: TurnstileSize;
  theme?: TurnstileTheme;
  appearance?: TurnstileAppearance;
  language?: string;
  action?: string;
};

export function TurnstileWidget({
  onToken,
  className,
  size = "normal",
  theme = "light",
  appearance = "always",
  language = "ar",
  action,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        size,
        theme,
        appearance,
        language,
        ...(action ? { action } : {}),
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [action, appearance, language, onToken, siteKey, size, theme]);

  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-[65px] w-full max-w-[300px] overflow-hidden [&_iframe]:max-w-full",
        className
      )}
    />
  );
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}
