import type { Metadata } from "next";
import { SearchResultsList } from "@/components/search/search-results-list";
import { SiteSearchForm } from "@/components/search/site-search-form";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { searchDashboardContent } from "@/lib/global-search";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import {
  getMergedSearchSuggestions,
  recordSearchQuery,
} from "@/lib/search-analytics";
import { isSearchQueryValid } from "@/lib/search-utils";
import { getOrCreateUser } from "@/lib/user";
import { after } from "next/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/search",
    namespace: "search",
    titleKey: "dashboardTitle",
    descriptionKey: "dashboardPlaceholder",
  });
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function DashboardSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getOrCreateUser();
  const tCommon = await getTranslations("common");

  if (!user) {
    return <p>{tCommon("loading")}</p>;
  }

  const params = await searchParams;
  const query = getQueryValue(params.q).trim();
  const hasValidQuery = isSearchQueryValid(query);
  const [t, { queries: suggestedQueries, hasPopular }, results] =
    await Promise.all([
      getTranslations("search"),
      getMergedSearchSuggestions("dashboard"),
      hasValidQuery
        ? searchDashboardContent(user.id, query)
        : Promise.resolve([]),
    ]);

  if (hasValidQuery) {
    after(() => {
      void recordSearchQuery("dashboard", query, user.id);
    });
  }

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("dashboardTitle")}</h1>
      <p className="mb-6 text-text/70">{t("dashboardPlaceholder")}</p>

      <SiteSearchForm
        action="/dashboard/search"
        scope="dashboard"
        defaultQuery={query}
        suggestedQueries={suggestedQueries}
        showPopularHint={hasPopular}
        placeholder={t("dashboardPlaceholder")}
        buttonLabel={t("buttonLabel")}
        className="mb-8"
      />

      {!query ? (
        <p className="text-center text-sm text-text/60">{t("noQuery")}</p>
      ) : !hasValidQuery ? (
        <Card className="py-10 text-center">
          <p className="text-text/70">{t("minChars")}</p>
        </Card>
      ) : results.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-text/70">{t("noResults")}</p>
        </Card>
      ) : (
        <SearchResultsList results={results} />
      )}
    </div>
  );
}
