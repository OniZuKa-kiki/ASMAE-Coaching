import {

  clerkAccountLockedCopy,

  clerkInvitationCopy,

  clerkMagicLinkCopy,

  clerkNewDeviceCopy,

  clerkPasswordChangedCopy,

  clerkPasswordRemovedCopy,

  clerkPasswordResetCopy,

  clerkPrimaryEmailChangedCopy,

  clerkVerificationCodeCopy,

} from "@/lib/email-copy";

import {

  renderClerkAccountLockedEmail,

  renderClerkInvitationEmail,

  renderClerkMagicLinkEmail,

  renderClerkNewDeviceEmail,

  renderClerkPasswordChangedEmail,

  renderClerkPasswordRemovedEmail,

  renderClerkPasswordResetEmail,

  renderClerkPrimaryEmailChangedEmail,

  renderClerkVerificationCodeEmail,

} from "@/lib/email-templates";

import { sendClerkAuthEmail } from "@/lib/email";

import { getPublicContactEmail } from "@/lib/site-settings";

import { getEmailLangForAddress } from "@/lib/user-locale";



export type ClerkEmailCreatedPayload = {

  slug?: string;

  to_email_address?: string;

  email_address?: string;

  subject?: string;

  delivered_by_clerk?: boolean;

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

    readString(data.otp) ??

    readString(data.code) ??

    readString(data.token) ??

    readString(data.verification_code)

  );

}



function extractActionUrl(data: Record<string, unknown> | undefined): string | null {

  if (!data) return null;

  return (

    readString(data.action_url) ??

    readString(data.invitation_url) ??

    readString(data.invite_url) ??

    readString(data.magic_link) ??

    readString(data.url) ??

    readString(data.sign_in_url) ??

    readString(data.token)

  );

}



function extractNewEmail(data: Record<string, unknown> | undefined): string | null {

  if (!data) return null;

  return (

    readString(data.new_email_address) ??

    readString(data.email_address) ??

    readString(data.primary_email_address)

  );

}



async function sendNoticeEmail({

  to,

  subject,

  html,

}: {

  to: string;

  subject: string;

  html: string;

}) {

  await sendClerkAuthEmail({ to, subject, html });

}



export async function handleClerkEmailCreated(

  payload: ClerkEmailCreatedPayload

): Promise<{ handled: boolean; reason?: string }> {

  const customMode = process.env.CLERK_CUSTOM_AUTH_EMAILS ?? "auto";



  if (customMode === "never") {

    return { handled: false, reason: "CLERK_CUSTOM_AUTH_EMAILS=never" };

  }



  if (customMode === "auto" && payload.delivered_by_clerk === true) {

    return { handled: false, reason: "already delivered by Clerk" };

  }



  const to = extractRecipient(payload);

  const slug = readString(payload.slug);

  const data = payload.data ?? {};

  const [contactEmail, lang] = await Promise.all([

    getPublicContactEmail(),

    getEmailLangForAddress(to),

  ]);



  if (!to || !slug) {

    return { handled: false, reason: "missing recipient or slug" };

  }



  switch (slug) {

    case "verification_code": {

      const code = extractOtpCode(data);

      if (!code) return { handled: false, reason: "missing otp code" };

      await sendNoticeEmail({

        to,

        subject: clerkVerificationCodeCopy[lang].subject,

        html: renderClerkVerificationCodeEmail({ code, contactEmail, lang }),

      });

      return { handled: true };

    }

    case "reset_password_code": {

      const code = extractOtpCode(data);

      if (!code) return { handled: false, reason: "missing otp code" };

      await sendNoticeEmail({

        to,

        subject: clerkPasswordResetCopy[lang].subject,

        html: renderClerkPasswordResetEmail({ code, contactEmail, lang }),

      });

      return { handled: true };

    }

    case "magic_link":

    case "magic_link_sign_in": {

      const actionUrl = extractActionUrl(data);

      if (!actionUrl) return { handled: false, reason: "missing action url" };

      await sendNoticeEmail({

        to,

        subject: clerkMagicLinkCopy[lang].subject,

        html: renderClerkMagicLinkEmail({ actionUrl, contactEmail, lang }),

      });

      return { handled: true };

    }

    case "new_device_sign_in":

    case "sign_in_from_new_device":

    case "client_trust": {

      const code = extractOtpCode(data);

      if (!code) return { handled: false, reason: "missing otp code" };

      await sendNoticeEmail({

        to,

        subject: clerkNewDeviceCopy[lang].subject,

        html: renderClerkNewDeviceEmail({ code, contactEmail, lang }),

      });

      return { handled: true };

    }

    case "invitation":

    case "organization_invitation": {

      const actionUrl = extractActionUrl(data);

      if (!actionUrl) return { handled: false, reason: "missing invitation url" };

      await sendNoticeEmail({

        to,

        subject: clerkInvitationCopy[lang].subject,

        html: renderClerkInvitationEmail({ actionUrl, contactEmail, lang }),

      });

      return { handled: true };

    }

    case "account_locked": {

      await sendNoticeEmail({

        to,

        subject: clerkAccountLockedCopy[lang].subject,

        html: renderClerkAccountLockedEmail({ contactEmail, lang }),

      });

      return { handled: true };

    }

    case "password_changed": {

      await sendNoticeEmail({

        to,

        subject: clerkPasswordChangedCopy[lang].subject,

        html: renderClerkPasswordChangedEmail({ contactEmail, lang }),

      });

      return { handled: true };

    }

    case "password_removed": {

      await sendNoticeEmail({

        to,

        subject: clerkPasswordRemovedCopy[lang].subject,

        html: renderClerkPasswordRemovedEmail({ contactEmail, lang }),

      });

      return { handled: true };

    }

    case "primary_email_address_changed":

    case "email_address_changed": {

      await sendNoticeEmail({

        to,

        subject: clerkPrimaryEmailChangedCopy[lang].subject,

        html: renderClerkPrimaryEmailChangedEmail({

          newEmail: extractNewEmail(data),

          contactEmail,

          lang,

        }),

      });

      return { handled: true };

    }

    default:

      return { handled: false, reason: `unsupported slug: ${slug}` };

  }

}

