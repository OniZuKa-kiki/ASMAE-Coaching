import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getUserRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getSiteSettings,
  normalizeInstagramInput,
  normalizeWhatsappInput,
  SITE_SETTINGS_ID,
} from "@/lib/site-settings";

export const dynamic = "force-dynamic";

async function updateCommunicationSettings(
  formData: FormData
): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const coachEmail = String(formData.get("coachEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const whatsappRaw = String(formData.get("whatsapp") || "").trim();
  const instagramRaw = String(formData.get("instagram") || "").trim();

  if (!contactEmail) return incomplete("ar");

  const whatsappUrl = normalizeWhatsappInput(whatsappRaw);
  const instagram = normalizeInstagramInput(instagramRaw);

  return runAction("ar", async () => {
    await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: {
        id: SITE_SETTINGS_ID,
        contactEmail,
        coachEmail: coachEmail || null,
        contactPhone: contactPhone || null,
        whatsappUrl: whatsappUrl || null,
        instagramUrl: instagram.url || null,
        instagramHandle: instagram.handle || null,
      },
      update: {
        contactEmail,
        coachEmail: coachEmail || null,
        contactPhone: contactPhone || null,
        whatsappUrl: whatsappUrl || null,
        instagramUrl: instagram.url || null,
        instagramHandle: instagram.handle || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath(adminUrl("/settings/communication"));
  }, "updated");
}

export default async function AdminCommunicationSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const settings = await getSiteSettings();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">التواصل والبريد</h1>
          <p className="text-sm text-text/70 mt-1">
            عدّل بيانات التواصل المعروضة على الموقع (بريد، واتساب، إنستغرام…).
          </p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="font-heading text-xl text-heading mb-4">
            معلومات التواصل
          </h2>
          <ActionForm
            action={updateCommunicationSettings}
            locale="ar"
            className="space-y-4"
          >
            <div>
              <Label htmlFor="contactEmail">البريد الإلكتروني العام</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                placeholder="contact@votredomaine.ma"
                required
              />
              <p className="text-xs text-text/60 mt-1">
                يظهر في التذييل وصفحة التواصل وقوالب البريد.
              </p>
            </div>

            <div>
              <Label htmlFor="coachEmail">بريد استقبال الرسائل</Label>
              <Input
                id="coachEmail"
                name="coachEmail"
                type="email"
                defaultValue={settings.coachEmail ?? ""}
                placeholder="asmae@gmail.com"
              />
              <p className="text-xs text-text/60 mt-1">
                يستقبل رسائل نموذج التواصل. إن تُرك فارغاً، يُستخدم{" "}
                <code>COACH_EMAIL</code> من المتغيرات أو البريد العام أعلاه.
              </p>
            </div>

            <div>
              <Label htmlFor="contactPhone">الهاتف (اختياري)</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={settings.contactPhone ?? ""}
                placeholder="+212 6 00 00 00 00"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">واتساب</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={settings.whatsappUrl ?? ""}
                placeholder="+212600000000 أو https://wa.me/212600000000"
              />
              <p className="text-xs text-text/60 mt-1">
                رقم هاتف أو رابط كامل — يُحوَّل تلقائياً إلى رابط واتساب.
              </p>
            </div>

            <div>
              <Label htmlFor="instagram">إنستغرام</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={
                  settings.instagramHandle
                    ? `@${settings.instagramHandle.replace(/^@/, "")}`
                    : settings.instagramUrl ?? ""
                }
                placeholder="@asmae_coaching أو رابط كامل"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              حفظ التغييرات
            </button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">معاينة</h2>
          <ul className="space-y-2 text-sm text-text/80">
            <li>
              <span className="font-semibold text-heading">البريد:</span>{" "}
              {settings.contactEmail}
            </li>
            {settings.contactPhone && (
              <li>
                <span className="font-semibold text-heading">الهاتف:</span>{" "}
                {settings.contactPhone}
              </li>
            )}
            {settings.whatsappUrl && (
              <li>
                <span className="font-semibold text-heading">واتساب:</span>{" "}
                <a
                  href={settings.whatsappUrl}
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.whatsappUrl}
                </a>
              </li>
            )}
            {settings.instagramUrl && (
              <li>
                <span className="font-semibold text-heading">إنستغرام:</span>{" "}
                <a
                  href={settings.instagramUrl}
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {settings.instagramHandle
                    ? `@${settings.instagramHandle}`
                    : settings.instagramUrl}
                </a>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
