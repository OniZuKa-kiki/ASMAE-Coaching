import { Suspense } from "react";
import { Users, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardTitle } from "@/components/ui/card";
import { AdminTodayOverview } from "@/components/admin/today-overview";
import { AdminAdvancedStats } from "@/components/admin/advanced-stats";
import { PanelPageSkeleton } from "@/components/ui/panel-page-skeleton";
import {
  getAdminAdvancedStats,
  getAdminDashboardStats,
  getAdminTodayOverview,
} from "@/lib/admin-stats";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function AdminDashboardContent() {
  const locale = (await getLocale()) as AppLocale;
  const [data, today, advanced, t, tEmpty] = await Promise.all([
    getAdminDashboardStats(locale),
    getAdminTodayOverview(locale),
    getAdminAdvancedStats(locale),
    getTranslations("adminPages.dashboard"),
    getTranslations("adminPages.empty"),
  ]);

  const stats = [
    {
      label: t("stats.clients"),
      value: String(data.clients.value),
      icon: Users,
      change: data.clients.change,
    },
    {
      label: t("stats.bookingsThisMonth"),
      value: String(data.bookingsThisMonth.value),
      icon: Calendar,
      change: data.bookingsThisMonth.change,
    },
    {
      label: t("stats.revenueThisMonth"),
      value: data.revenueThisMonth.value,
      icon: CreditCard,
      change: data.revenueThisMonth.change,
    },
    {
      label: t("stats.conversionRate"),
      value: data.conversionRate.value,
      icon: TrendingUp,
      change: data.conversionRate.change,
    },
  ];

  return (
    <>
      <AdminTodayOverview data={today} />
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="mb-3 flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-primary">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-heading">{stat.value}</p>
            <p className="text-sm text-text/70">{stat.label}</p>
          </Card>
        ))}
      </div>
      <AdminAdvancedStats data={advanced} />
      {!data.hasActivity ? (
        <Card className="py-12 text-center">
          <CardTitle className="mb-3">{tEmpty("noStats")}</CardTitle>
          <p className="text-text/70">{tEmpty("noStatsHint")}</p>
        </Card>
      ) : null}
    </>
  );
}

export default async function AdminPage() {
  const t = await getTranslations("adminPages.dashboard");

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>
      <Suspense
        fallback={
          <PanelPageSkeleton variant="stats" showFilters={false} rows={0} />
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}
