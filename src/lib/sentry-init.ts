import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

export function isSentryEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

export function getSentryEnvironment() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

export function getSentryInitOptions():
  | NodeOptions
  | EdgeOptions
  | BrowserOptions {
  const enabled = isSentryEnabled();

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled,
    environment: getSentryEnvironment(),
    tracesSampleRate: enabled
      ? process.env.NODE_ENV === "production"
        ? 0.1
        : 1
      : 0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (!enabled) return null;
      return event;
    },
  };
}
