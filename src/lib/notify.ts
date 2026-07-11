"use client";

import { toast } from "sonner";
import {
  getFriendlyErrors,
  toFriendlyError,
  type ErrorLocale,
} from "@/lib/api-errors";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(
  error: unknown,
  fallback?: string,
  locale: ErrorLocale = "ar"
) {
  const errors = getFriendlyErrors(locale);
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : (fallback ?? errors.generic);
  toast.error(toFriendlyError(message, undefined, locale));
}
