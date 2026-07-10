import { siteConfig } from "@/lib/constants";
import { getEmailLogoSrc } from "@/lib/email-logo";

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
  lang?: "ar" | "fr";
  contactEmail?: string;
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
}: EmailLayoutOptions): string {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const appUrl = siteConfig.url;
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";
  const safeFooter = footerNote ? escapeHtml(footerNote) : "";
  const preheaderText = preheader ? escapeHtml(preheader) : "";
  const logoSrc = getEmailLogoSrc();

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
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
      .email-header { padding: 32px 24px 24px 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.ivory}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${
    preheaderText
      ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${colors.ivory};">${preheaderText}</div>`
      : ""
  }

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${colors.ivory};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${colors.card}; border-radius: 20px; overflow: hidden; border: 1px solid ${colors.border}; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">

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
            <td class="email-padding" style="padding: 32px 40px 8px 40px;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 600; color: ${colors.heading}; line-height: 1.3;">
                ${safeTitle}
              </h1>
              ${
                safeSubtitle
                  ? `<p style="margin: 12px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.6;">${safeSubtitle}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td class="email-padding" style="padding: 16px 40px 24px 40px;">
              ${body}
            </td>
          </tr>

          ${ctaBlock}

          <!-- Signature -->
          <tr>
            <td class="email-padding" style="padding: 0 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-top: 24px; border-top: 1px solid ${colors.border};">
                    <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${colors.text};">
                      بكل تقدير،
                    </p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 600; color: ${colors.sage};">
                      Asmae
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
                © ${new Date().getFullYear()} ASMAE Coaching — جميع الحقوق محفوظة
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

export function messageQuote(message: string): string {
  const safe = escapeHtml(message).replace(/\n/g, "<br />");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 20px 24px; background-color: ${colors.white}; border: 1px solid ${colors.border}; border-radius: 12px; border-left: 4px solid ${colors.gold};">
          <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: ${colors.gold}; text-transform: uppercase; letter-spacing: 1px;">
            الرسالة
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
    preheader: `رسالة جديدة من ${name} عبر موقع ASMAE Coaching`,
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
}: {
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  meetingUrl?: string;
  contactEmail?: string;
}): string {
  const visioBlock = meetingUrl
    ? infoCard(
        "رابط الفيديو",
        `<a href="${escapeHtml(meetingUrl)}" style="color: ${colors.sage}; text-decoration: underline; word-break: break-all;">انضم للجلسة</a>`,
        true
      )
    : "";

  return renderEmailLayout({
    preheader: `جلستك ${serviceName} مؤكدة ليوم ${date}`,
    title: `مرحباً ${clientName}،`,
    subtitle: "جلسة الكوتشينغ الخاصة بك مؤكدة. إليك كل التفاصيل للاستعداد باطمئنان.",
    body: `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7;">
        يسعدني مرافقتك في هذه الجلسة. خصصي لحظة للجلوس في مكان هادئ مع اتصال مستقر.
      </p>
      ${infoCard("الخدمة", escapeHtml(serviceName))}
      ${infoCard("التاريخ", escapeHtml(date))}
      ${infoCard("الوقت", escapeHtml(time) + " (توقيت باريس)")}
      ${visioBlock}
      <p style="margin: 20px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${colors.muted}; line-height: 1.6; text-align: center;">
        في حال التعذر، يرجى إبلاغي قبل 24 ساعة على الأقل.
      </p>
    `,
    cta: meetingUrl
      ? { label: "انضم لجلستي", href: meetingUrl }
      : undefined,
    footerNote: "تلقيت هذا البريد بعد حجزك على asmae-coaching.fr",
    contactEmail,
  });
}

export function renderCoursePurchaseEmail({
  clientName,
  courseName,
  dashboardUrl,
  contactEmail = siteConfig.contact.email,
}: {
  clientName: string;
  courseName: string;
  dashboardUrl: string;
  contactEmail?: string;
}): string {
  return renderEmailLayout({
    preheader: `مرحباً بك في دورة ${courseName}`,
    title: `مرحباً ${clientName}،`,
    subtitle: "شكراً لثقتك. دورتك جاهزة — يمكنك البدء الآن.",
    body: `
      <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7;">
        تهانينا على هذه الخطوة نحو ازدهارك. مساحتك الشخصية في انتظارك مع كل محتوى الدورة.
      </p>
      ${infoCard("الدورة", escapeHtml(courseName), true)}
      <p style="margin: 20px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${colors.muted}; line-height: 1.6; text-align: center;">
        تقدمي بوتيرتك — كل وحدة متاحة مدى الحياة من مساحتك.
      </p>
    `,
    cta: { label: "الوصول إلى دورتي", href: dashboardUrl },
    footerNote: "تلقيت هذا البريد بعد شرائك على asmae-coaching.fr",
    contactEmail,
  });
}

function otpCodeBlock(code: string): string {
  const safe = escapeHtml(code);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 8px 0 20px 0;">
          <div style="display: inline-block; padding: 20px 32px; background-color: ${colors.ivory}; border: 2px solid ${colors.sage}; border-radius: 16px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: ${colors.sage};">${safe}</span>
          </div>
        </td>
      </tr>
    </table>`;
}

export function renderClerkVerificationCodeEmail({
  code,
  contactEmail = siteConfig.contact.email,
}: {
  code: string;
  contactEmail?: string;
}): string {
  return renderEmailLayout({
    preheader: `رمز التحقق الخاص بك: ${code}`,
    title: "رمز التحقق",
    subtitle: "أدخلي الرمز التالي لمتابعة تسجيل الدخول إلى ASMAE Coaching.",
    body: `
      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7; text-align: center;">
        هذا الرمز صالح لفترة محدودة. لا تشاركيه مع أي شخص.
      </p>
      ${otpCodeBlock(code)}
      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: ${colors.muted}; line-height: 1.6; text-align: center;">
        إن لم تطلُبي هذا الرمز، يمكنك تجاهل هذا البريد بأمان.
      </p>
    `,
    footerNote: "بريد أمان — تسجيل الدخول إلى مساحتكِ",
    lang: "ar",
    contactEmail,
  });
}

export function renderClerkPasswordResetEmail({
  code,
  contactEmail = siteConfig.contact.email,
}: {
  code: string;
  contactEmail?: string;
}): string {
  return renderEmailLayout({
    preheader: `رمز إعادة تعيين كلمة المرور: ${code}`,
    title: "إعادة تعيين كلمة المرور",
    subtitle: "استخدمي الرمز التالي لإنشاء كلمة مرور جديدة.",
    body: `
      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7; text-align: center;">
        إن لم تطلُبي إعادة التعيين، تجاهلي هذا البريد.
      </p>
      ${otpCodeBlock(code)}
    `,
    footerNote: "بريد أمان — إعادة تعيين كلمة المرور",
    lang: "ar",
    contactEmail,
  });
}

export function renderClerkMagicLinkEmail({
  actionUrl,
  contactEmail = siteConfig.contact.email,
}: {
  actionUrl: string;
  contactEmail?: string;
}): string {
  const safeUrl = escapeHtml(actionUrl);
  return renderEmailLayout({
    preheader: "رابط تسجيل الدخول إلى ASMAE Coaching",
    title: "تسجيل الدخول",
    subtitle: "اضغطي على الزر أدناه للوصول إلى مساحتكِ بأمان.",
    body: `
      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7; text-align: center;">
        الرابط صالح لفترة محدودة ولمرة واحدة.
      </p>
      <p style="margin: 16px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: ${colors.muted}; line-height: 1.5; word-break: break-all; text-align: center;">
        ${safeUrl}
      </p>
    `,
    cta: { label: "تسجيل الدخول", href: actionUrl },
    footerNote: "بريد أمان — رابط تسجيل الدخول",
    lang: "ar",
    contactEmail,
  });
}

export function renderClerkNewDeviceEmail({
  code,
  contactEmail = siteConfig.contact.email,
}: {
  code: string;
  contactEmail?: string;
}): string {
  return renderEmailLayout({
    preheader: `رمز التحقق من جهاز جديد: ${code}`,
    title: "تسجيل دخول من جهاز جديد",
    subtitle: "لحماية حسابكِ، نحتاج للتحقق من هويتكِ قبل المتابعة.",
    body: `
      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: ${colors.text}; line-height: 1.7; text-align: center;">
        إن لم تكوني أنتِ من حاول تسجيل الدخول، تجاهلي هذا البريد وغيّري كلمة المرور.
      </p>
      ${otpCodeBlock(code)}
    `,
    footerNote: "بريد أمان — جهاز جديد",
    lang: "ar",
    contactEmail,
  });
}
