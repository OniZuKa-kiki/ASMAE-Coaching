import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getActionLocale } from "@/lib/action-locale";
import { getUserRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getSiteSettings,
  normalizeInstagramInput,
  normalizeWhatsappInput,
  SITE_SETTINGS_ID,
} from "@/lib/site-settings";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function updateCommunicationSettings(
  formData: FormData
): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const coachEmail = String(formData.get("coachEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const whatsappRaw = String(formData.get("whatsapp") || "").trim();
  const instagramRaw = String(formData.get("instagram") || "").trim();

  if (!contactEmail) return incomplete(locale);

  const whatsappUrl = normalizeWhatsappInput(whatsappRaw);
  const instagram = normalizeInstagramInput(instagramRaw);

  return runAction(locale, async () => {
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

  const locale = (await getLocale()) as AppLocale;
  const [t, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.communication"),
    getTranslations("admin.common"),
  ]);
  const settings = await getSiteSettings();

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

      <div className="max-w-2xl space-y-6">
        <Card>
          <h2 className="mb-4 font-heading text-xl text-heading">{t("contactSection")}</h2>
          <ActionForm
            action={updateCommunicationSettings}
            locale={locale}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                placeholder="contact@votredomaine.ma"
                required
              />
              <p className="mt-1 text-xs text-text/60">{t("contactEmailHint")}</p>
            </div>

            <div>
              <Label htmlFor="coachEmail">{t("coachEmail")}</Label>
              <Input
                id="coachEmail"
                name="coachEmail"
                type="email"
                defaultValue={settings.coachEmail ?? ""}
                placeholder="asmae@gmail.com"
              />
              <p className="mt-1 text-xs text-text/60">{t("coachEmailHint")}</p>
            </div>

            <div>
              <Label htmlFor="contactPhone">{t("contactPhone")}</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={settings.contactPhone ?? ""}
                placeholder="+212 6 00 00 00 00"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={settings.whatsappUrl ?? ""}
                placeholder="+212600000000 ou https://wa.me/212600000000"
              />
              <p className="mt-1 text-xs text-text/60">{t("whatsappHint")}</p>
            </div>

            <div>
              <Label htmlFor="instagram">{t("instagram")}</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={
                  settings.instagramHandle
                    ? `@${settings.instagramHandle.replace(/^@/, "")}`
                    : settings.instagramUrl ?? ""
                }
                placeholder="@asmae_coaching ou lien complet"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {t("saveChanges")}
            </button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("preview")}</h2>
          <ul className="space-y-2 text-sm text-text/80">
            <li>
              <span className="font-semibold text-heading">{t("previewEmail")}</span>{" "}
              {settings.contactEmail}
            </li>
            {settings.contactPhone && (
              <li>
                <span className="font-semibold text-heading">{t("previewPhone")}</span>{" "}
                {settings.contactPhone}
              </li>
            )}
            {settings.whatsappUrl && (
              <li>
                <span className="font-semibold text-heading">{t("previewWhatsapp")}</span>{" "}
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
                <span className="font-semibold text-heading">{t("previewInstagram")}</span>{" "}
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
