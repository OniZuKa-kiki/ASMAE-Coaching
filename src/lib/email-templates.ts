import { siteConfig } from "@/lib/constants";
import {
  bookingConfirmationCopy,
  bookingReminderCopy,
  clerkAccountLockedCopy,
  clerkInvitationCopy,
  clerkMagicLinkCopy,
  clerkNewDeviceCopy,
  clerkPasswordChangedCopy,
  clerkPasswordRemovedCopy,
  clerkPasswordResetCopy,
  clerkPrimaryEmailChangedCopy,
  clerkVerificationCodeCopy,
  coursePurchaseCopy,
  emailLayoutCopy,
  type EmailLang,
} from "@/lib/email-copy";
import { getEmailLogoDataUri, getEmailLogoSrc } from "@/lib/email-logo";

const colors = {
  sage: "#6B7C6A",
  sageDark: "#5D6D5B",
  gold: "#B89A5E",
  ivory: "#F7F4EE",
  card: "#FCFAF8",
  heading: "#2E2E2E",
  text: "#555555",
  muted: "#8A857C",
  border: "#DDD7CD",
  white: "#FFFFFF",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailLayoutOptions {
  preheader?: string;
  title: string;
  subtitle?: string;
  body: string;
  cta?: { label: string; href: string };
  footerNote?: string;
  lang?: EmailLang;
  contactEmail?: string;
  /** Aperçu navigateur : logo en data URI au lieu de cid: */
  forPreview?: boolean;
}

export function renderEmailLayout({
  preheader,
  title,
  subtitle,
  body,
  cta,
  footerNote,
  lang = "ar",
  contactEmail = siteConfig.contact.email,
  forPreview = false,
}: EmailLayoutOptions): string {
  const layout = emailLayoutCopy[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const align = lang === "ar" ? "right" : "left";
  const tdAlign = lang === "ar" ? "right" : "left";
  const fontStack =
    lang === "ar"
      ? "'Segoe UI', Tahoma, 'Helvetica Neue', Arial, sans-serif"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const cellDir = `direction: ${dir}; text-align: ${align}; unicode-bidi: embed;`;
  const arabicStyles =
    lang === "ar"
      ? `
    body, table, td, p, h1, h2, h3, div, span {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: plaintext;
    }
    .email-ltr {
      direction: ltr !important;
      text-align: center !important;
      unicode-bidi: embed;
    }`
      : "";
  const appUrl = siteConfig.url;
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";
  const safeFooter = footerNote ? escapeHtml(footerNote) : "";
  const preheaderText = preheader ? escapeHtml(preheader) : "";
  const logoSrc = forPreview ? getEmailLogoDataUri() : getEmailLogoSrc();

  const ctaBlock = cta
    ? `
      <tr>
        <td style="padding: 8px 40px 32px 40px; text-align: center;">
          <a href="${cta.href}" style="display: inline-block; background-color: ${colors.sage}; color: ${colors.white}; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; text-decoration: none; padding: 14px 32px; border-radius: 999px; mso-padding-alt: 0;">
            <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
            <span style="mso-text-raise: 15pt;">${escapeHtml(cta.label)}</span>
            <!--[if mso]><i style="letter-spacing: 25px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    ${arabicStyles}
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
      .email-header { padding: 32px 24px 24px 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.ivory}; direction: ${dir}; text-align: ${align}; unicode-bidi: embed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${
    preheaderText
      ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${colors.ivory};">${preheaderText}</div>`
      : ""
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.ivory};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width: 600px; width: 100%; background-color: ${colors.card}; border-radius: 20px; overflow: hidden; border: 1px solid ${colors.border}; box-shadow: 0 8px 30px rgba(0,0,0,0.06); direction: ${dir};">

          <!-- Bandeau doré -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${colors.gold} 0%, ${colors.sage} 50%, ${colors.gold} 100%); background-color: ${colors.gold}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- En-tête -->
          <tr>
            <td class="email-header" style="padding: 36px 40px 28px 40px; text-align: center; background-color: ${colors.card};">
              <a href="${appUrl}" style="text-decoration: none; display: inline-block;">
                <img
                  src="${logoSrc}"
                  alt="${escapeHtml(siteConfig.name)} ${escapeHtml(siteConfig.tagline)} — ${escapeHtml(siteConfig.motto)}"
                  width="180"
                  style="display: block; margin: 0 auto; max-width: 180px; width: 180px; height: auto; border: 0; outline: none;"
                />
              </a>
            </td>
          </tr>

          <!-- Séparateur -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: ${colors.border};"></div>
            </td>
          </tr>

          <!-- Titre -->
          <tr>
            <td align="${tdAlign}" dir="${dir}" class="email-padding" style="padding: 32px 40px 8px 40px; ${cellDir}">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 600; color: ${colors.heading}; line-height: 1.4; ${cellDir}">
                ${safeTitle}
              </h1>
              ${
                safeSubtitle
                  ? `<p style="margin: 12px 0 0 0; font-family: ${fontStack}; font-size: 15px; color: ${colors.text}; line-height: 1.8; ${cellDir}">${safeSubtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td align="${tdAlign}" dir="${dir}" class="email-padding" style="padding: 16px 40px 24px 40px; ${cellDir}">
              ${body}
            </td>
          </tr>

          ${ctaBlock}

          <!-- Signature -->
          <tr>
            <td align="${tdAlign}" dir="${dir}" class="email-padding" style="padding: 0 40px 32px 40px; ${cellDir}">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}">
                <tr>
                  <td align="${tdAlign}" dir="${dir}" style="padding-top: 24px; border-top: 1px solid ${colors.border}; ${cellDir}">
                    <p style="margin: 0 0 4px 0; font-family: ${fontStack}; font-size: 14px; color: ${colors.text}; ${cellDir}">
                      ${escapeHtml(layout.signOff)}
                    </p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: ${colors.sage}; ${cellDir}">
                      ${escapeHtml(layout.signOffName)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${colors.sage}; text-align: center;">
              ${
                safeFooter
                  ? `<p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.5;">${safeFooter}</p>`
                  : ""
              }
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: rgba(255,255,255,0.7);">
                <a href="${appUrl}" style="color: rgba(255,255,255,0.9); text-decoration: underline;">asmae-coaching.fr</a>
                &nbsp;·&nbsp;
                <a href="mailto:${escapeHtml(contactEmail)}" style="color: rgba(255,255,255,0.9); text-decoration: underline;">${escapeHtml(contactEmail)}</a>
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.5);">
                © ${new Date().getFullYear()} ${escapeHtml(layout.brandName)} — ${escapeHtml(layout.rights)}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function infoCard(label: string, value: string, highlight = false): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
      <tr>
        <td style="padding: 16px 20px; background-color: ${highlight ? colors.white : colors.ivory}; border: 1px solid ${colors.border}; border-radius: 12px; border-left: 3px solid ${highlight ? colors.gold : colors.sage};">
          <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 1px;">
            ${escapeHtml(label)}
          </p>
          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.heading}; line-height: 1.5;">
            ${value}
          </p>
        </td>
      </tr>
    </table>`;
}

export function messageQuote(message: string, lang: EmailLang = "ar"): string {
  const safe = escapeHtml(message).replace(/\n/g, "<br />");
  const label = emailLayoutCopy[lang].messageLabel;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 20px 24px; background-color: ${colors.white}; border: 1px solid ${colors.border}; border-radius: 12px; border-left: 4px solid ${colors.gold};">
          <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
            ${escapeHtml(label)}
          </p>
          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7; font-style: italic;">
            «&nbsp;${safe}&nbsp;»
          </p>
        </td>
      </tr>
    </table>`;
}

export function renderContactEmail({
  name,
  email,
  message,
  contactEmail = siteConfig.contact.email,
}: {
  name: string;
  email: string;
  message: string;
  contactEmail?: string;
}): string {
  const safeEmail = escapeHtml(email);
  return renderEmailLayout({
    preheader: `رسالة جديدة من ${name} عبر موقع الكوتشينغ`,
    title: "وصلتك رسالة جديدة",
    subtitle: "أرسل أحد زوار الموقع رسالة عبر نموذج التواصل.",
    body: `
      ${infoCard("الاسم", escapeHtml(name), true)}
      ${infoCard("البريد الإلكتروني", `<a href="mailto:${safeEmail}" style="color: ${colors.sage}; text-decoration: none; font-weight: 600;">${safeEmail}</a>`, true)}
      <div style="margin-top: 20px;">
        ${messageQuote(message)}
      </div>
      <p style="margin: 24px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: ${colors.muted}; text-align: center;">
        يمكنك الرد مباشرة على هذا البريد للتواصل مع ${escapeHtml(name)}.
      </p>
    `,
    cta: {
      label: `الرد على ${name.split(" ")[0]}`,
      href: `mailto:${safeEmail}`,
    },
    footerNote: "إشعار تلقائي — نموذج التواصل",
    lang: "ar",
    contactEmail,
  });
}

export function renderBookingConfirmationEmail({
  clientName,
  serviceName,
  date,
  time,
  meetingUrl,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = bookingConfirmationCopy[lang];
  const visioBlock = meetingUrl
    ? infoCard(
        copy.videoLabel,
        `<a href="${escapeHtml(meetingUrl)}" style="color: ${colors.sage}; text-decoration: underline; word-break: break-all;">${escapeHtml(copy.joinLink)}</a>`,
        true
      )
    : "";

  return renderEmailLayout({
    preheader: copy.preheader(serviceName, date),
    title: copy.title(clientName),
    subtitle: copy.subtitle,
    body: `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7;">
        ${escapeHtml(copy.intro)}
      </p>
      ${infoCard(copy.serviceLabel, escapeHtml(serviceName))}
      ${infoCard(copy.dateLabel, escapeHtml(date))}
      ${infoCard(copy.timeLabel, escapeHtml(time) + copy.timeZone)}
      ${visioBlock}
      <p style="margin: 20px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${colors.muted}; line-height: 1.6; text-align: center;">
        ${escapeHtml(copy.cancelNote)}
      </p>
    `,
    cta: meetingUrl
      ? { label: copy.ctaJoin, href: meetingUrl }
      : undefined,
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

export function renderBookingReminderEmail({
  clientName,
  serviceName,
  date,
  time,
  meetingUrl,
  contactEmail = siteConfig.contact.email,
  forPreview = false,
  lang = "ar",
}: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
  contactEmail?: string;
  forPreview?: boolean;
  lang?: EmailLang;
}): string {
  const copy = bookingReminderCopy[lang];
  const visioBlock = meetingUrl
    ? infoCard(
        copy.videoLabel,
        `<a href="${escapeHtml(meetingUrl)}" style="color: ${colors.sage}; text-decoration: underline; word-break: break-all;">${escapeHtml(copy.joinLink)}</a>`,
        true
      )
    : "";

  return renderEmailLayout({
    preheader: copy.preheader(serviceName, date),
    title: copy.title(clientName),
    subtitle: copy.subtitle,
    body: `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7;">
        ${escapeHtml(copy.intro)}
      </p>
      ${infoCard(copy.serviceLabel, escapeHtml(serviceName))}
      ${infoCard(copy.dateLabel, escapeHtml(date))}
      ${infoCard(copy.timeLabel, escapeHtml(time) + copy.timeZone)}
      ${visioBlock}
    `,
    cta: meetingUrl
      ? { label: copy.ctaJoin, href: meetingUrl }
      : { label: copy.ctaBookings, href: `${siteConfig.url}/dashboard/bookings` },
    footerNote: copy.footerNote,
    lang,
    contactEmail,
    forPreview,
  });
}

export function renderCoursePurchaseEmail({
  clientName,
  courseName,
  dashboardUrl,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  clientName: string;
  courseName: string;
  dashboardUrl: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = coursePurchaseCopy[lang];

  return renderEmailLayout({
    preheader: copy.preheader(courseName),
    title: copy.title(clientName),
    subtitle: copy.subtitle,
    body: `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7;">
        ${escapeHtml(copy.intro)}
      </p>
      ${infoCard(copy.courseLabel, escapeHtml(courseName), true)}
      <p style="margin: 20px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${colors.muted}; line-height: 1.6; text-align: center;">
        ${escapeHtml(copy.paceNote)}
      </p>
    `,
    cta: { label: copy.cta, href: dashboardUrl },
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

function otpCodeBlock(code: string): string {
  const safe = escapeHtml(code);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" class="email-ltr" style="padding: 8px 0 20px 0; direction: ltr; text-align: center;">
          <div style="display: inline-block; padding: 20px 32px; background-color: ${colors.ivory}; border: 2px solid ${colors.sage}; border-radius: 16px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: ${colors.sage}; direction: ltr; unicode-bidi: embed; display: inline-block;">${safe}</span>
          </div>
        </td>
      </tr>
    </table>`;
}

function rtlEmailParagraph(text: string, muted = false): string {
  const color = muted ? colors.muted : colors.text;
  const size = muted ? "13px" : "15px";
  const safe = escapeHtml(text);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
      <tr>
        <td align="right" dir="rtl" style="direction: rtl; text-align: right; unicode-bidi: plaintext;">
          <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: ${size}; color: ${color}; line-height: 1.8; direction: rtl; text-align: right; unicode-bidi: plaintext;">${safe}</p>
        </td>
      </tr>
    </table>`;
}

function emailParagraph(text: string, lang: EmailLang, muted = false): string {
  if (lang === "ar") return rtlEmailParagraph(text, muted);
  const color = muted ? colors.muted : colors.text;
  const size = muted ? "13px" : "15px";
  const safe = escapeHtml(text);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
      <tr>
        <td align="left" dir="ltr" style="direction: ltr; text-align: left;">
          <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: ${size}; color: ${color}; line-height: 1.8;">${safe}</p>
        </td>
      </tr>
    </table>`;
}

export function renderClerkVerificationCodeEmail({
  code,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  code: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkVerificationCodeCopy[lang];
  return renderEmailLayout({
    preheader: copy.preheader(code),
    title: copy.title,
    subtitle: copy.subtitle,
    body: `
      ${emailParagraph(copy.codeExpiryNote, lang)}
      ${otpCodeBlock(code)}
      ${emailParagraph(copy.ignoreNote, lang, true)}
    `,
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

export function renderClerkPasswordResetEmail({
  code,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  code: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkPasswordResetCopy[lang];
  return renderEmailLayout({
    preheader: copy.preheader(code),
    title: copy.title,
    subtitle: copy.subtitle,
    body: `
      ${emailParagraph(copy.ignoreNote, lang)}
      ${otpCodeBlock(code)}
    `,
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

export function renderClerkMagicLinkEmail({
  actionUrl,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  actionUrl: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkMagicLinkCopy[lang];
  const safeUrl = escapeHtml(actionUrl);
  return renderEmailLayout({
    preheader: copy.preheader(),
    title: copy.title,
    subtitle: copy.subtitle,
    body: `
      ${emailParagraph(copy.codeExpiryNote, lang)}
      ${emailParagraph(safeUrl, lang, true)}
    `,
    cta: { label: copy.cta, href: actionUrl },
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

export function renderClerkNewDeviceEmail({
  code,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  code: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkNewDeviceCopy[lang];
  return renderEmailLayout({
    preheader: copy.preheader(code),
    title: copy.title,
    subtitle: copy.subtitle,
    body: `
      ${emailParagraph(copy.ignoreNote, lang)}
      ${otpCodeBlock(code)}
    `,
    footerNote: copy.footerNote,
    lang,
    contactEmail,
  });
}

function renderClerkSecurityNoticeEmail({
  preheader,
  title,
  subtitle,
  paragraphs,
  cta,
  footerNote,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  preheader: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  cta?: { label: string; href: string };
  footerNote: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  return renderEmailLayout({
    preheader,
    title,
    subtitle,
    body: paragraphs.map((paragraph) => emailParagraph(paragraph, lang)).join(""),
    cta,
    footerNote,
    lang,
    contactEmail,
  });
}

export function renderClerkInvitationEmail({
  actionUrl,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  actionUrl: string;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkInvitationCopy[lang];
  return renderClerkSecurityNoticeEmail({
    preheader: copy.preheader,
    title: copy.title,
    subtitle: copy.subtitle,
    paragraphs: copy.paragraphs,
    cta: { label: copy.cta, href: actionUrl },
    footerNote: copy.footerNote,
    contactEmail,
    lang,
  });
}

export function renderClerkAccountLockedEmail({
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkAccountLockedCopy[lang];
  return renderClerkSecurityNoticeEmail({
    preheader: copy.preheader,
    title: copy.title,
    subtitle: copy.subtitle,
    paragraphs: copy.paragraphs,
    footerNote: copy.footerNote,
    contactEmail,
    lang,
  });
}

export function renderClerkPasswordChangedEmail({
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkPasswordChangedCopy[lang];
  return renderClerkSecurityNoticeEmail({
    preheader: copy.preheader,
    title: copy.title,
    subtitle: copy.subtitle,
    paragraphs: copy.paragraphs,
    footerNote: copy.footerNote,
    contactEmail,
    lang,
  });
}

export function renderClerkPasswordRemovedEmail({
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkPasswordRemovedCopy[lang];
  return renderClerkSecurityNoticeEmail({
    preheader: copy.preheader,
    title: copy.title,
    subtitle: copy.subtitle,
    paragraphs: copy.paragraphs,
    footerNote: copy.footerNote,
    contactEmail,
    lang,
  });
}

export function renderClerkPrimaryEmailChangedEmail({
  newEmail,
  contactEmail = siteConfig.contact.email,
  lang = "ar",
}: {
  newEmail?: string | null;
  contactEmail?: string;
  lang?: EmailLang;
}): string {
  const copy = clerkPrimaryEmailChangedCopy[lang];
  const emailLine = newEmail
    ? `${copy.newEmailLabel}: ${newEmail}`
    : copy.updatedFallback;

  return renderClerkSecurityNoticeEmail({
    preheader: copy.preheader,
    title: copy.title,
    subtitle: copy.subtitle,
    paragraphs: [emailLine, ...copy.paragraphs],
    footerNote: copy.footerNote,
    contactEmail,
    lang,
  });
}
