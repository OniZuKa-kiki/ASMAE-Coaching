import arMessages from "../../messages/ar.json";
import frMessages from "../../messages/fr.json";
import {
  getFriendlyErrors,
  getAdminErrorsCopy,
  toFriendlyActionError,
} from "@/lib/api-errors";
import { getUserRole } from "@/lib/auth";

export type ActionLocale = "ar" | "fr";

export type ActionResult =
  | { ok: true; message?: string; redirect?: string }
  | { ok: false; error: string };

const actionMessagesByLocale = {
  ar: arMessages.actions,
  fr: frMessages.actions,
} as const;

export type ActionMessageKey = keyof typeof arMessages.actions;

export function actionSuccess(
  locale: ActionLocale,
  key: ActionMessageKey,
  redirect?: string
): ActionResult {
  return { ok: true, message: actionMessagesByLocale[locale][key], redirect };
}

export function actionFail(error: string): ActionResult {
  return { ok: false, error };
}

export function incomplete(locale: ActionLocale): ActionResult {
  return actionFail(getFriendlyErrors(locale).incomplete);
}

export function unauthorized(
  locale: ActionLocale,
  forAdmin = false
): ActionResult {
  if (forAdmin) return actionFail(getAdminErrorsCopy(locale).unauthorized);
  return actionFail(getFriendlyErrors(locale).unauthorized);
}

export async function ensureAdmin(): Promise<ActionResult | null> {
  const role = await getUserRole();
  if (role !== "admin") {
    const { getActionLocale } = await import("@/lib/action-locale");
    const locale = await getActionLocale();
    return unauthorized(locale, true);
  }
  return null;
}

export async function runAction(
  locale: ActionLocale,
  fn: () => Promise<void>,
  successKey: ActionMessageKey,
  redirect?: string
): Promise<ActionResult> {
  try {
    await fn();
    return actionSuccess(locale, successKey, redirect);
  } catch (error) {
    console.error("[action]", error);
    const message = error instanceof Error ? error.message : String(error);
    return actionFail(toFriendlyActionError(message, locale));
  }
}
