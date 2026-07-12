import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { Resend } from "resend";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getActionLocale } from "@/lib/action-locale";
import { getAdminErrors, getAdminPagesCopy } from "@/lib/admin-i18n";
import {
  actionFail,
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getUserRole } from "@/lib/auth";
import { getEmailLogoAttachment } from "@/lib/email-logo";
import { renderEmailLayout, escapeHtml } from "@/lib/email-templates";
import { siteConfig } from "@/lib/constants";
import {
  getCoachNotificationEmail,
  getPublicContactEmail,
} from "@/lib/site-settings";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function getEmailConfigSnapshot() {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Coaching de vie <contact@asmae-coaching.fr>";
  const coachEmail = await getCoachNotificationEmail();
  const contactEmail = await getPublicContactEmail();

  return {
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    fromEmail,
    coachEmail,
    contactEmail,
  };
}

async function sendTestEmail(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const copy = getAdminPagesCopy(locale).settings.emails.testEmail;
  const to = String(formData.get("to") || "").trim();
  if (!to) return incomplete(locale);

  const cfg = await getEmailConfigSnapshot();
  if (!cfg.resendConfigured || !process.env.RESEND_API_KEY) {
    return actionFail(getAdminErrors(locale).emailUnavailable);
  }

  return runAction(locale, async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = renderEmailLayout({
      preheader: copy.preheader,
      title: copy.title,
      subtitle: copy.subtitle,
      body: `
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        ${copy.bodyConfirm}
      </p>
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        ${copy.recipient} <strong>${escapeHtml(to)}</strong>
      </p>
      <p style="margin: 0; line-height: 1.8;">
        ${copy.bodySuccess}
      </p>
    `,
      cta: { label: copy.cta, href: siteConfig.url },
      footerNote: copy.footer,
      contactEmail: cfg.contactEmail,
    });

    const { error } = await resend.emails.send({
      from: cfg.fromEmail,
      to,
      subject: copy.subject,
      html,
      attachments: [getEmailLogoAttachment()],
    });

    if (error) {
      console.error("[Resend test]", error);
      throw new Error(error.message);
    }

    revalidatePath("/admin/settings/emails");
  }, "sent");
}

export default async function AdminEmailSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [t, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.emails"),
    getTranslations("admin.common"),
  ]);
  const cfg = await getEmailConfigSnapshot();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("title")}</h1>
          <p className="mt-1 text-sm text-text/70">{t("subtitle")}</p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("statusSection")}</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">{t("emailService")}</span>{" "}
              {cfg.resendConfigured ? t("active") : t("unavailable")}
            </p>
            <p>
              <span className="font-semibold text-heading">{t("fromEmail")}</span>{" "}
              <span dir="ltr" className="inline-block">
                {cfg.fromEmail}
              </span>
            </p>
            <p>
              <span className="font-semibold text-heading">{t("coachEmail")}</span>{" "}
              <span dir="ltr" className="inline-block">
                {cfg.coachEmail}
              </span>
            </p>
            <p>
              <span className="font-semibold text-heading">{t("publicEmail")}</span>{" "}
              <span dir="ltr" className="inline-block">
                {cfg.contactEmail}
              </span>
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("testSection")}</h2>
          <p className="mb-4 text-sm text-text/70">{t("testHint")}</p>
          <ActionForm
            action={sendTestEmail}
            locale={locale}
            className="flex flex-col items-end gap-3 sm:flex-row"
          >
            <AdminFormField
              label={t("recipientEmail")}
              htmlFor="test-email-to"
              className="w-full flex-1"
              hint={t("recipientHint")}
            >
              <Input
                id="test-email-to"
                name="to"
                type="email"
                placeholder="name@example.com"
                className="w-full"
                required
              />
            </AdminFormField>
            <button
              type="submit"
              disabled={!cfg.resendConfigured}
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("send")}
            </button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("remindersSection")}</h2>
          <p className="mb-4 text-sm leading-relaxed text-text/70">{t("remindersBody")}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text/80">
            <li>{t("remindersList1")}</li>
            <li>{t("remindersList2")}</li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("infoSection")}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text/80">
            <li>
              {t("infoContact")}{" "}
              <Link
                href={adminUrl("/settings/communication")}
                className="text-primary underline"
              >
                {t("infoContactLink")}
              </Link>
              ).
            </li>
            <li>{t("infoBooking")}</li>
            <li>{t("infoReminder")}</li>
            <li>{t("infoLogo")}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
