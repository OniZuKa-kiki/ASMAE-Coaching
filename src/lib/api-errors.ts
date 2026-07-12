import arMessages from "../../messages/ar.json";
import frMessages from "../../messages/fr.json";
import adminPagesAr from "../../messages/admin-pages-ar.json";
import adminPagesFr from "../../messages/admin-pages-fr.json";

function getAdminErrorsCopy(locale: ErrorLocale) {
  return locale === "fr" ? adminPagesFr.errors : adminPagesAr.errors;
}

export { getAdminErrorsCopy };

/** Messages affichés aux utilisateurs — jamais de détails techniques */
export type ErrorLocale = "ar" | "fr";

export type FriendlyErrorsCopy = typeof arMessages.errors;

const errorsByLocale: Record<ErrorLocale, FriendlyErrorsCopy> = {
  ar: arMessages.errors,
  fr: frMessages.errors,
};

export function getFriendlyErrors(locale: ErrorLocale = "ar"): FriendlyErrorsCopy {
  return errorsByLocale[locale];
}

export function toFriendlyActionError(
  message: string,
  locale: ErrorLocale = "ar"
): string {
  return toFriendlyError(message, undefined, locale);
}

export function toFriendlyError(
  message: string,
  status?: number,
  locale: ErrorLocale = "ar"
): string {
  const errors = getFriendlyErrors(locale);

  if (status === 401 || message === "Non authentifié") {
    return errors.unauthorized;
  }
  if (message === "INVALID_MOOD") {
    return errors.invalidMood;
  }
  if (message === "SLUG_TAKEN") {
    return getAdminErrorsCopy(locale).slugTaken;
  }
  if (message === "NOT_FOUND") {
    return getAdminErrorsCopy(locale).notFound;
  }
  if (message === "ADMIN_EMAIL_UNAVAILABLE") {
    return getAdminErrorsCopy(locale).emailUnavailable;
  }
  if (
    message === "PAYMENT_UNAVAILABLE" ||
    message === "PURCHASE_UNAVAILABLE"
  ) {
    return message === "PURCHASE_UNAVAILABLE"
      ? errors.purchaseUnavailable
      : errors.paymentUnavailable;
  }
  if (
    message.includes("créneau") ||
    message.includes("disponible") ||
    message.includes("موعد") ||
    message.includes("متاح") ||
    message === "SLOT_UNAVAILABLE"
  ) {
    return errors.slotUnavailable;
  }
  if (
    message.includes("déjà") ||
    message.includes("possédez") ||
    message.includes("بالفعل")
  ) {
    return errors.alreadyOwned;
  }
  if (
    message.includes("incomplet") ||
    message.includes("requis") ||
    message.includes("مطلوب")
  ) {
    return errors.incomplete;
  }
  if (
    message.includes("Stripe") ||
    message.includes("STRIPE") ||
    message.includes("PayZone") ||
    message.includes("PAYZONE") ||
    message.includes(".env")
  ) {
    return errors.paymentUnavailable;
  }
  if (message.includes("Resend") || message.includes("RESEND")) {
    return errors.emailUnavailable;
  }
  if (status && status >= 500) {
    return errors.generic;
  }
  if (!message.includes("env.") && !message.includes("API_KEY")) {
    return message;
  }
  return errors.generic;
}
