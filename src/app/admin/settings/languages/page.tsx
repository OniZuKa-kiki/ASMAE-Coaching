import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { adminUrl } from "@/lib/admin-path";
import { updateLocaleSettings } from "@/lib/admin-locale-settings-actions";
import { getUserRole } from "@/lib/auth";
import { getLocaleSettings } from "@/lib/locale-settings";

export const dynamic = "force-dynamic";

export default async function AdminLanguagesSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const [settings, t, tCommon] = await Promise.all([
    getLocaleSettings(),
    getTranslations("admin.languagesPage"),
    getTranslations("admin.common"),
  ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("title")}</h1>
          <p className="text-sm text-text/70 mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          {tCommon("back")}
        </Link>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <h2 className="font-heading text-xl text-heading mb-2">
            {t("publicTitle")}
          </h2>
          <p className="text-sm text-text/70 mb-6">{t("publicHint")}</p>

          <ActionForm action={updateLocaleSettings} className="space-y-5">
            <label className="flex items-start gap-3 rounded-2xl border border-border/70 p-4 cursor-pointer">
              <input
                type="checkbox"
                name="localeArEnabled"
                defaultChecked={settings.ar}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block font-semibold text-heading">
                  {t("arLabel")}
                </span>
                <span className="block text-sm text-text/70 mt-1">
                  {t("arHint")}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-border/70 p-4 cursor-pointer">
              <input
                type="checkbox"
                name="localeFrEnabled"
                defaultChecked={settings.fr}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block font-semibold text-heading">
                  {t("frLabel")}
                </span>
                <span className="block text-sm text-text/70 mt-1">
                  {t("frHint")}
                </span>
              </span>
            </label>

            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              {t("save")}
            </button>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-2">
            {t("adminTitle")}
          </h2>
          <p className="text-sm text-text/70">{t("adminHint")}</p>
        </Card>
      </div>
    </div>
  );
}
