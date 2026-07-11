import type { EmailLang } from "@/lib/email-copy";
import type { AppLocale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { toEmailLang } from "@/lib/user-locale";

export type NotificationText = {
  title: string;
  body: string;
};

function appLocaleFromLang(lang: EmailLang): AppLocale {
  return lang === "fr" ? "fr" : "ar";
}

function sessionBody(
  lang: EmailLang,
  parts: { service: string; date: string; time: string }
): string {
  if (lang === "fr") {
    return `${parts.service} — ${parts.date} à ${parts.time}`;
  }
  return `${parts.service} — ${parts.date} في ${parts.time}`;
}

export async function getUserNotificationLang(userId: string): Promise<EmailLang> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLocale: true },
  });
  return toEmailLang(user?.preferredLocale);
}

export function bookingConfirmedNotification(
  lang: EmailLang,
  parts: { service: string; date: string; time: string }
): NotificationText {
  return {
    title: lang === "fr" ? "Votre séance est confirmée" : "تم تأكيد جلستك",
    body: sessionBody(lang, parts),
  };
}

export function bookingReminderNotification(
  lang: EmailLang,
  parts: { service: string; date: string; time: string }
): NotificationText {
  return {
    title:
      lang === "fr" ? "Rappel : séance demain" : "تذكير بجلستك غداً",
    body: sessionBody(lang, parts),
  };
}

export function upcomingBookingNotification(
  lang: EmailLang,
  parts: { service: string; date: string; time: string }
): NotificationText {
  return {
    title: lang === "fr" ? "Séance à venir bientôt" : "جلسة قادمة قريباً",
    body: sessionBody(lang, parts),
  };
}

export function sessionReviewNotification(
  lang: EmailLang,
  serviceTitle: string
): NotificationText {
  return {
    title:
      lang === "fr"
        ? "Évaluez votre dernière séance"
        : "قيّم جلستك الأخيرة",
    body: serviceTitle,
  };
}

export function sessionReviewPromptNotification(
  lang: EmailLang,
  serviceTitle: string
): NotificationText {
  return {
    title: lang === "fr" ? "Évaluez votre séance" : "قيّم جلستك",
    body: serviceTitle,
  };
}

export function coursePurchaseNotification(
  lang: EmailLang,
  courseTitle: string
): NotificationText {
  return {
    title: lang === "fr" ? "Votre formation est prête" : "دورتك جاهزة",
    body: courseTitle,
  };
}

export function goalDeadlineNotification(
  lang: EmailLang,
  parts: { title: string; date: string }
): NotificationText {
  return {
    title: lang === "fr" ? "Échéance d'objectif proche" : "موعد هدف يقترب",
    body:
      lang === "fr"
        ? `${parts.title} — ${parts.date}`
        : `${parts.title} — ${parts.date}`,
  };
}

export function podcastContinueNotification(
  lang: EmailLang,
  podcastTitle: string
): NotificationText {
  return {
    title: lang === "fr" ? "Reprendre l'écoute" : "تابع الاستماع",
    body: podcastTitle,
  };
}

export function notificationLocale(lang: EmailLang): AppLocale {
  return appLocaleFromLang(lang);
}
