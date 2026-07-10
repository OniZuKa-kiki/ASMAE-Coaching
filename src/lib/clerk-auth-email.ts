import {
  renderClerkMagicLinkEmail,
  renderClerkNewDeviceEmail,
  renderClerkPasswordResetEmail,
  renderClerkVerificationCodeEmail,
} from "@/lib/email-templates";
import { sendClerkAuthEmail } from "@/lib/email";
import { getPublicContactEmail } from "@/lib/site-settings";

export type ClerkEmailCreatedPayload = {
  slug?: string;
  to_email_address?: string;
  email_address?: string;
  subject?: string;
  data?: Record<string, unknown>;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractRecipient(payload: ClerkEmailCreatedPayload): string | null {
  return (
    readString(payload.to_email_address) ?? readString(payload.email_address)
  );
}

function extractOtpCode(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  return (
    readString(data.otp_code) ??
    readString(data.code) ??
    readString(data.otp) ??
    readString(data.verification_code)
  );
}

function extractActionUrl(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  return (
    readString(data.action_url) ??
    readString(data.magic_link) ??
    readString(data.url) ??
    readString(data.sign_in_url)
  );
}

export async function handleClerkEmailCreated(
  payload: ClerkEmailCreatedPayload
): Promise<{ handled: boolean; reason?: string }> {
  const to = extractRecipient(payload);
  const slug = readString(payload.slug);
  const data = payload.data ?? {};
  const contactEmail = await getPublicContactEmail();

  if (!to || !slug) {
    return { handled: false, reason: "missing recipient or slug" };
  }

  switch (slug) {
    case "verification_code": {
      const code = extractOtpCode(data);
      if (!code) return { handled: false, reason: "missing otp code" };
      await sendClerkAuthEmail({
        to,
        subject: "رمز التحقق — ASMAE Coaching",
        html: renderClerkVerificationCodeEmail({ code, contactEmail }),
      });
      return { handled: true };
    }
    case "reset_password_code": {
      const code = extractOtpCode(data);
      if (!code) return { handled: false, reason: "missing otp code" };
      await sendClerkAuthEmail({
        to,
        subject: "إعادة تعيين كلمة المرور — ASMAE Coaching",
        html: renderClerkPasswordResetEmail({ code, contactEmail }),
      });
      return { handled: true };
    }
    case "magic_link":
    case "magic_link_sign_in": {
      const actionUrl = extractActionUrl(data);
      if (!actionUrl) return { handled: false, reason: "missing action url" };
      await sendClerkAuthEmail({
        to,
        subject: "رابط تسجيل الدخول — ASMAE Coaching",
        html: renderClerkMagicLinkEmail({ actionUrl, contactEmail }),
      });
      return { handled: true };
    }
    case "new_device_sign_in":
    case "client_trust": {
      const code = extractOtpCode(data);
      if (!code) return { handled: false, reason: "missing otp code" };
      await sendClerkAuthEmail({
        to,
        subject: "تسجيل دخول من جهاز جديد — ASMAE Coaching",
        html: renderClerkNewDeviceEmail({ code, contactEmail }),
      });
      return { handled: true };
    }
    default:
      return { handled: false, reason: `unsupported slug: ${slug}` };
  }
}
