import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { getAdminPagesCopy } from "@/lib/admin-i18n";
import { getUserRole } from "@/lib/auth";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function getMeetingMode(locale: AppLocale) {
  const modes = getAdminPagesCopy(locale).settings.visio.modes;
  const staticZoomUrl = process.env.ZOOM_STATIC_MEETING_URL?.trim();
  const staticMeetUrl = process.env.GOOGLE_MEET_STATIC_URL?.trim();
  const zoomAccountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const zoomClientId = process.env.ZOOM_CLIENT_ID?.trim();
  const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (staticZoomUrl) {
    return {
      title: modes.zoomStaticTitle,
      description: modes.zoomStaticDesc,
      status: modes.active,
      provider: modes.zoomStaticProvider,
    };
  }

  if (staticMeetUrl) {
    return {
      title: modes.meetStaticTitle,
      description: modes.meetStaticDesc,
      status: modes.active,
      provider: modes.meetStaticProvider,
    };
  }

  if (zoomAccountId && zoomClientId && zoomClientSecret) {
    return {
      title: modes.zoomAutoTitle,
      description: modes.zoomAutoDesc,
      status: modes.ready,
      provider: modes.zoomAutoProvider,
    };
  }

  return {
    title: modes.noneTitle,
    description: modes.noneDesc,
    status: modes.needsSetup,
    provider: modes.noneProvider,
  };
}

export default async function AdminVisioSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [t, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.visio"),
    getTranslations("admin.common"),
  ]);
  const mode = getMeetingMode(locale);

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
          <h2 className="mb-3 font-heading text-xl text-heading">{mode.title}</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">{t("statusLabel")}</span>{" "}
              {mode.status}
            </p>
            <p>
              <span className="font-semibold text-heading">{t("modeLabel")}</span>{" "}
              {mode.provider}
            </p>
            <p>{mode.description}</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("howItWorks")}</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text/80">
            <li>{t("howItWorks1")}</li>
            <li>{t("howItWorks2")}</li>
            <li>{t("howItWorks3")}</li>
            <li>{t("howItWorks4")}</li>
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-xl text-heading">{t("tipTitle")}</h2>
          <p className="text-sm text-text/80">{t("tipBody")}</p>
        </Card>
      </div>
    </div>
  );
}
