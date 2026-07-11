import { Resend } from "resend";
import { getEmailLogoAttachment } from "@/lib/email-logo";
import {
  renderBookingConfirmationEmail,
  renderBookingReminderEmail,
  renderContactEmail,
  renderCoursePurchaseEmail,
} from "@/lib/email-templates";
import type { EmailLang } from "@/lib/email-copy";
import { bookingConfirmationCopy, bookingReminderCopy, coursePurchaseCopy } from "@/lib/email-copy";
import {
  getCoachNotificationEmail,
  getPublicContactEmail,
} from "@/lib/site-settings";

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "ASMAE Coaching <contact@asmae-coaching.fr>";
}

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function getLogoAttachment() {
  return getEmailLogoAttachment();
}

async function sendEmail(
  payload: Parameters<Resend["emails"]["send"]>[0]
) {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY non configuré");
  }

  const { error } = await resend.emails.send(payload);
  if (error) {
    console.error("[Resend]", error);
    throw new Error(error.message);
  }
}

export async function sendBookingConfirmation({
  to,
  clientName,
  serviceName,
  date,
  time,
  meetingUrl,
  lang = "ar",
}: {
  to: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
  lang?: EmailLang;
}) {
  const contactEmail = await getPublicContactEmail();
  const copy = bookingConfirmationCopy[lang];

  await sendEmail({
    from: getFromEmail(),
    to,
    subject: copy.subject,
    html: renderBookingConfirmationEmail({
      clientName,
      serviceName,
      date,
      time,
      meetingUrl,
      contactEmail,
      lang,
    }),
    attachments: [getLogoAttachment()],
  });
}

export async function sendBookingReminder({
  to,
  clientName,
  serviceName,
  date,
  time,
  meetingUrl,
  lang = "ar",
}: {
  to: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
  lang?: EmailLang;
}) {
  const contactEmail = await getPublicContactEmail();
  const copy = bookingReminderCopy[lang];

  await sendEmail({
    from: getFromEmail(),
    to,
    subject: copy.subject,
    html: renderBookingReminderEmail({
      clientName,
      serviceName,
      date,
      time,
      meetingUrl,
      contactEmail,
      lang,
    }),
    attachments: [getLogoAttachment()],
  });
}

export async function sendCoursePurchaseConfirmation({
  to,
  clientName,
  courseName,
  lang = "ar",
}: {
  to: string;
  clientName: string;
  courseName: string;
  lang?: EmailLang;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const contactEmail = await getPublicContactEmail();
  const copy = coursePurchaseCopy[lang];

  await sendEmail({
    from: getFromEmail(),
    to,
    subject: copy.subject(courseName),
    html: renderCoursePurchaseEmail({
      clientName,
      courseName,
      dashboardUrl: `${appUrl}/dashboard/courses`,
      contactEmail,
      lang,
    }),
    attachments: [getLogoAttachment()],
  });
}

export async function sendContactMessage({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const coachEmail = await getCoachNotificationEmail();
  const contactEmail = await getPublicContactEmail();

  await sendEmail({
    from: getFromEmail(),
    to: coachEmail,
    replyTo: email,
    subject: `رسالة جديدة من ${name} — ASMAE Coaching`,
    html: renderContactEmail({ name, email, message, contactEmail }),
    attachments: [getLogoAttachment()],
  });
}

export async function sendClerkAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await sendEmail({
    from: getFromEmail(),
    to,
    subject,
    html,
    attachments: [getLogoAttachment()],
  });
}
