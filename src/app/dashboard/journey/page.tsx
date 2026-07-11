import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JourneyOverview } from "@/components/dashboard/journey-overview";
import { getUserJourneyData } from "@/lib/journey";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/journey",
    namespace: "dashboard.journey",
    titleKey: "title",
    descriptionKey: "subtitle",
  });
}

export default async function DashboardJourneyPage() {
  const [user, t, tCommon] = await Promise.all([
    getOrCreateUser(),
    getTranslations("dashboard.journey"),
    getTranslations("common"),
  ]);

  if (!user) {
    return <p>{tCommon("loading")}</p>;
  }

  const data = await getUserJourneyData();
  if (!data) {
    return <p>{tCommon("loading")}</p>;
  }

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("title")}</h1>
      <p className="mb-8 text-text/70">{t("subtitle")}</p>
      <JourneyOverview data={data} />
    </div>
  );
}
