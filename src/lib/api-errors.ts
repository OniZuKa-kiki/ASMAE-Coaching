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
  contactSuccess: "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.",
  bookingRedirect: "جاري توجيهك إلى صفحة الدفع…",
} as const;

/** Messages admin (arabe) */
export const adminErrors = {
  unauthorized: "غير مصرح بالوصول.",
  incomplete: "يرجى ملء جميع الحقول المطلوبة.",
  notFound: "العنصر غير موجود.",
  emailUnavailable:
    "إرسال البريد غير متاح. تحقق من إعدادات Resend.",
  generic: "حدث خطأ. يرجى المحاولة مجدداً.",
} as const;

export function toFriendlyActionError(
  message: string,
  locale: "ar" | "fr" = "ar"
): string {
  if (locale === "fr") {
    if (
      message.includes("Non authentifié") ||
      message.includes("admin") ||
      message.includes("autorisé")
    ) {
      return adminErrors.unauthorized;
    }
    if (
      message.includes("requis") ||
      message.includes("incomplet") ||
      message.includes("Veuillez")
    ) {
      return adminErrors.incomplete;
    }
    if (message.includes("Resend") || message.includes("RESEND")) {
      return adminErrors.emailUnavailable;
    }
    if (
      message.includes("Stripe") ||
      message.includes("PayZone") ||
      message.includes(".env") ||
      message.includes("API_KEY")
    ) {
      return adminErrors.generic;
    }
    if (!message.includes("env.") && message.length < 120) {
      return message;
    }
    return adminErrors.generic;
  }
  return toFriendlyError(message);
}

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
