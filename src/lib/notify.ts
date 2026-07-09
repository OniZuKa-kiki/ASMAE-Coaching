"use client";

import { toast } from "sonner";
import { friendlyErrors, toFriendlyError } from "@/lib/api-errors";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(error: unknown, fallback: string = friendlyErrors.generic) {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : fallback;
  toast.error(toFriendlyError(message));
}
