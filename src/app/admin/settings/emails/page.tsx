import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminErrors } from "@/lib/api-errors";
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

export const dynamic = "force-dynamic";

async function getEmailConfigSnapshot() {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "ASMAE Coaching <onboarding@resend.dev>";
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

  const to = String(formData.get("to") || "").trim();
  if (!to) return incomplete("ar");

  const cfg = await getEmailConfigSnapshot();
  if (!cfg.resendConfigured || !process.env.RESEND_API_KEY) {
    return actionFail(adminErrors.emailUnavailable);
  }

  return runAction("ar", async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = renderEmailLayout({
      preheader: "بريد تجريبي — ASMAE Coaching",
      title: "بريد تجريبي",
      subtitle: "التحقق من إعدادات الإرسال",
      body: `
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        يؤكد هذا البريد أن الإرسال يعمل بشكل صحيح من موقعك.
      </p>
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        المستلم: <strong>${escapeHtml(to)}</strong>
      </p>
      <p style="margin: 0; line-height: 1.8;">
        إذا استلمت هذه الرسالة، فإعداد Resend يعمل بشكل صحيح.
      </p>
    `,
      cta: { label: "فتح الموقع", href: siteConfig.url },
      footerNote: "بريد تلقائي — لا ترد عليه.",
      contactEmail: cfg.contactEmail,
    });

    const { error } = await resend.emails.send({
      from: cfg.fromEmail,
      to,
      subject: "Test — Emails ASMAE Coaching",
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

  const cfg = await getEmailConfigSnapshot();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">البريد الإلكتروني</h1>
          <p className="text-sm text-text/70 mt-1">
            حالة الإرسال والاختبار ومعاينة الرسائل.
          </p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">الحالة</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">Resend:</span>{" "}
              {cfg.resendConfigured ? "مُعدّ" : "غير مُعدّ"}
            </p>
            <p>
              <span className="font-semibold text-heading">From:</span>{" "}
              {cfg.fromEmail}
            </p>
            <p>
              <span className="font-semibold text-heading">بريد المدرب:</span>{" "}
              {cfg.coachEmail}
            </p>
            <p>
              <span className="font-semibold text-heading">البريد العام:</span>{" "}
              {cfg.contactEmail}
            </p>
            {!cfg.resendConfigured && (
              <p className="text-text/70">
                أضف <code>RESEND_API_KEY</code> في <code>.env.local</code>{" "}
                (محلياً) أو في متغيرات Vercel (الإنتاج).
              </p>
            )}
            {cfg.fromEmail.includes("resend.dev") && (
              <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-3">
                المرسل <code>onboarding@resend.dev</code>: Resend يُرسل
                فقط إلى بريد حساب Resend. لإرسال الرسائل لعملائك،
                تحقق من نطاق على{" "}
                <a
                  href="https://resend.com/domains"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  resend.com/domains
                </a>
                .
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">
            إرسال بريد تجريبي
          </h2>
          <p className="text-sm text-text/70 mb-4">
            يُرسل بريداً تجريبياً إلى العنوان الذي تختاره.
          </p>
          <ActionForm
            action={sendTestEmail}
            locale="ar"
            className="flex flex-col sm:flex-row gap-3 items-end"
          >
            <AdminFormField
              label="عنوان البريد المستلم"
              htmlFor="test-email-to"
              className="flex-1 w-full"
              hint="البريد الذي سيستلم الرسالة التجريبية."
            >
              <Input
                id="test-email-to"
                name="to"
                type="email"
                placeholder="you@gmail.com"
                className="w-full"
                required
              />
            </AdminFormField>
            <button
              type="submit"
              disabled={!cfg.resendConfigured}
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              إرسال
            </button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">معلومات مفيدة</h2>
          <ul className="space-y-2 text-sm text-text/80 list-disc pl-5">
            <li>
              بريد التواصل: يُرسل إلى بريد المدرب (قابل للتعديل من{" "}
              <Link
                href={adminUrl("/settings/communication")}
                className="text-primary underline"
              >
                التواصل والبريد
              </Link>
              {" "}أو <code>COACH_EMAIL</code>).
            </li>
            <li>
              رسائل الحجز / الدورة: تُرسل للعميل بعد
              تأكيد الدفع.
            </li>
            <li>
              الشعار مُضمّن مباشرة في البريد (يعمل محلياً).
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
