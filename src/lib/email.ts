import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import { getEmailLogoAttachment } from "@/lib/email-logo";
import {
  renderBookingConfirmationEmail,
  renderContactEmail,
  renderCoursePurchaseEmail,
} from "@/lib/email-templates";

const fromEmail =
  process.env.RESEND_FROM_EMAIL || "ASMAE Coaching <onboarding@resend.dev>";
const coachEmail = process.env.COACH_EMAIL || siteConfig.contact.email;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function getLogoAttachment() {
  return getEmailLogoAttachment();
}

export async function sendBookingConfirmation({
  to,
  clientName,
  serviceName,
  date,
  time,
  meetingUrl,
}: {
  to: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "تأكيد جلسة الكوتشينغ — ASMAE",
    html: renderBookingConfirmationEmail({
      clientName,
      serviceName,
      date,
      time,
      meetingUrl,
    }),
    attachments: [getLogoAttachment()],
  });
}

export async function sendCoursePurchaseConfirmation({
  to,
  clientName,
  courseName,
}: {
  to: string;
  clientName: string;
  courseName: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `الوصول إلى دورتك — ${courseName}`,
    html: renderCoursePurchaseEmail({
      clientName,
      courseName,
      dashboardUrl: `${appUrl}/dashboard/courses`,
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
  const resend = getResend();
  if (!resend) throw new Error("RESEND_API_KEY non configuré");

  await resend.emails.send({
    from: fromEmail,
    to: coachEmail,
    replyTo: email,
    subject: `Nouveau message de ${name} — ASMAE Coaching`,
    html: renderContactEmail({ name, email, message }),
    attachments: [getLogoAttachment()],
  });
}
