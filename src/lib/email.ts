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
}: {
  to: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
}) {
  await sendEmail({
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await sendEmail({
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
  await sendEmail({
    from: fromEmail,
    to: coachEmail,
    replyTo: email,
    subject: `Nouveau message de ${name} — ASMAE Coaching`,
    html: renderContactEmail({ name, email, message }),
    attachments: [getLogoAttachment()],
  });
}
