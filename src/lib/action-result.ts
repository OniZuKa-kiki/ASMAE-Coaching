import { adminErrors, friendlyErrors, toFriendlyActionError } from "@/lib/api-errors";
import { getUserRole } from "@/lib/auth";

export type ActionLocale = "ar" | "fr";

export type ActionResult =
  | { ok: true; message?: string; redirect?: string }
  | { ok: false; error: string };

export const actionMessages = {
  ar: {
    saved: "تم الحفظ بنجاح",
    created: "تم الإنشاء بنجاح",
    deleted: "تم الحذف بنجاح",
    updated: "تم التحديث بنجاح",
    toggled: "تم التحديث بنجاح",
    sent: "تم الإرسال بنجاح",
    completed: "تم التحديث بنجاح",
  },
  fr: {
    saved: "Enregistré avec succès",
    created: "Créé avec succès",
    deleted: "Supprimé avec succès",
    updated: "Mis à jour avec succès",
    toggled: "Mis à jour avec succès",
    sent: "Email envoyé avec succès",
    completed: "Mis à jour avec succès",
  },
} as const;

export type ActionMessageKey = keyof typeof actionMessages.ar;

export function actionSuccess(
  locale: ActionLocale,
  key: ActionMessageKey,
  redirect?: string
): ActionResult {
  return { ok: true, message: actionMessages[locale][key], redirect };
}

export function actionFail(error: string): ActionResult {
  return { ok: false, error };
}

export function incomplete(locale: ActionLocale): ActionResult {
  return actionFail(
    locale === "fr" ? adminErrors.incomplete : friendlyErrors.incomplete
  );
}

export function unauthorized(locale: ActionLocale): ActionResult {
  return actionFail(
    locale === "fr" ? adminErrors.unauthorized : friendlyErrors.unauthorized
  );
}

export async function ensureAdmin(): Promise<ActionResult | null> {
  const role = await getUserRole();
  if (role !== "admin") return unauthorized("ar");
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
