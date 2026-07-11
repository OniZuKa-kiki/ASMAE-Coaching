import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

export function isSentryEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

export function isSentryDevReportingEnabled() {
  return process.env.SENTRY_ENABLE_DEV === "1";
}

export function isSentryReportingEnabled() {
  if (!isSentryEnabled()) return false;
  if (process.env.NODE_ENV === "production") return true;
  return isSentryDevReportingEnabled();
}

export function getSentryEnvironment() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

function isIgnorableSentryEvent(event: {
  exception?: { values?: Array<{ type?: string; value?: string }> };
  message?: string;
}): boolean {
  const text = [
    event.message,
    ...(event.exception?.values?.map((v) => `${v.type ?? ""} ${v.value ?? ""}`) ??
      []),
  ]
    .filter(Boolean)
    .join("\n");

  if (
    text.includes("PrismaClientInitializationError") ||
    text.includes("Can't reach database server") ||
    text.includes("Cannot apply unknown utility class `section-title`") ||
    text.includes("@clerk/shared/authorization")
  ) {
    return true;
  }

  return false;
}

export function getSentryInitOptions():
  | NodeOptions
  | EdgeOptions
  | BrowserOptions {
  const enabled = isSentryEnabled();
  const reporting = isSentryReportingEnabled();
  const isProduction = process.env.NODE_ENV === "production";

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled,
    environment: getSentryEnvironment(),
    tracesSampleRate: enabled
      ? isProduction
        ? 0.1
        : reporting
          ? 0.2
          : 0
      : 0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (!reporting) return null;
      if (isIgnorableSentryEvent(event)) return null;
      return event;
    },
  };
}
