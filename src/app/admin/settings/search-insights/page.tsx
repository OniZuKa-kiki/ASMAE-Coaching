import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardTitle } from "@/components/ui/card";
import {
  getSearchAnalyticsForAdmin,
  getSearchAnalyticsTotals,
} from "@/lib/search-analytics";
import { formatDate } from "@/lib/utils";
import { adminUrl } from "@/lib/admin-path";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function SearchAnalyticsTable({
  title,
  rows,
  emptyLabel,
  columnQuery,
  columnCount,
  columnLastSearch,
  locale,
}: {
  title: string;
  rows: { query: string; searchCount: number; lastSearchedAt: Date }[];
  emptyLabel: string;
  columnQuery: string;
  columnCount: string;
  columnLastSearch: string;
  locale: AppLocale;
}) {
  return (
    <Card>
      <CardTitle className="mb-4 text-lg">{title}</CardTitle>
      {rows.length === 0 ? (
        <p className="text-sm text-text/70">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-start text-text/60">
                <th className="pb-2 pe-3 font-medium">{columnQuery}</th>
                <th className="pb-2 pe-3 font-medium">{columnCount}</th>
                <th className="pb-2 font-medium">{columnLastSearch}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {rows.map((row) => (
                <tr key={`${title}-${row.query}`}>
                  <td className="py-3 pe-3 font-medium text-heading">{row.query}</td>
                  <td className="py-3 pe-3 text-text/80">{row.searchCount}</td>
                  <td className="py-3 text-text/70">
                    {formatDate(row.lastSearchedAt, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default async function AdminSearchInsightsPage() {
  const locale = (await getLocale()) as AppLocale;
  const [t, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.searchInsights"),
    getTranslations("admin.common"),
  ]);

  const [publicRows, dashboardRows, totals] = await Promise.all([
    getSearchAnalyticsForAdmin("public"),
    getSearchAnalyticsForAdmin("dashboard"),
    getSearchAnalyticsTotals(),
  ]);

  const hasData = publicRows.length > 0 || dashboardRows.length > 0;

  return (
    <div>
      <div className="page-header mb-6">
        <div>
          <h1 className="page-header-title">{t("title")}</h1>
          <p className="mt-1 text-text/70">{t("subtitle")}</p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-2xl font-semibold text-heading">{totals.publicTotal}</p>
          <p className="text-sm text-text/70">{t("publicDistinct")}</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-heading">{totals.dashboardTotal}</p>
          <p className="text-sm text-text/70">{t("dashboardDistinct")}</p>
        </Card>
      </div>

      {!hasData ? (
        <Card className="py-12 text-center">
          <CardTitle className="mb-3">{t("noDataTitle")}</CardTitle>
          <p className="text-text/70">{t("noDataBody")}</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <SearchAnalyticsTable
            title={t("publicSection")}
            rows={publicRows}
            emptyLabel={t("noPublicSearches")}
            columnQuery={t("columnQuery")}
            columnCount={t("columnCount")}
            columnLastSearch={t("columnLastSearch")}
            locale={locale}
          />
          <SearchAnalyticsTable
            title={t("dashboardSection")}
            rows={dashboardRows}
            emptyLabel={t("noDashboardSearches")}
            columnQuery={t("columnQuery")}
            columnCount={t("columnCount")}
            columnLastSearch={t("columnLastSearch")}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
