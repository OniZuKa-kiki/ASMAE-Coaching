/** Messages affichés aux utilisateurs — jamais de détails techniques */
export const friendlyErrors = {
  paymentUnavailable:
    "الدفع عبر الإنترنت غير متاح مؤقتاً. تواصل معنا لإتمام حجزك.",
  purchaseUnavailable:
    "الشراء عبر الإنترنت غير متاح مؤقتاً. تواصل معنا للوصول إلى هذه الدورة.",
  emailUnavailable:
    "إرسال الرسالة غير متاح مؤقتاً. راسلنا مباشرة عبر البريد أو واتساب.",
  slotUnavailable: "هذا الموعد لم يعد متاحاً. اختر تاريخاً أو وقتاً آخر.",
  unauthorized: "سجّل الدخول للمتابعة.",
  alreadyOwned: "أنت تمتلك هذه الدورة بالفعل.",
  incomplete: "يرجى ملء جميع الحقول المطلوبة.",
  generic: "حدث خطأ. يرجى المحاولة مجدداً أو التواصل معنا.",
} as const;

export function toFriendlyError(
  message: string,
  status?: number
): string {
  if (status === 401 || message === "Non authentifié") {
    return friendlyErrors.unauthorized;
  }
  if (
    message.includes("créneau") ||
    message.includes("disponible") ||
    message.includes("موعد") ||
    message.includes("متاح") ||
    message === "SLOT_UNAVAILABLE"
  ) {
    return friendlyErrors.slotUnavailable;
  }
  if (
    message.includes("déjà") ||
    message.includes("possédez") ||
    message.includes("بالفعل")
  ) {
    return friendlyErrors.alreadyOwned;
  }
  if (
    message.includes("incomplet") ||
    message.includes("requis") ||
    message.includes("مطلوب")
  ) {
    return friendlyErrors.incomplete;
  }
  if (
    message.includes("Stripe") ||
    message.includes("STRIPE") ||
    message.includes("PayZone") ||
    message.includes("PAYZONE") ||
    message.includes(".env")
  ) {
    return friendlyErrors.paymentUnavailable;
  }
  if (message.includes("Resend") || message.includes("RESEND")) {
    return friendlyErrors.emailUnavailable;
  }
  if (status && status >= 500) {
    return friendlyErrors.generic;
  }
  if (!message.includes("env.") && !message.includes("API_KEY")) {
    return message;
  }
  return friendlyErrors.generic;
}
