import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { Card } from "@/components/ui/card";
import { SearchResultsList } from "@/components/search/search-results-list";
import { SiteSearchForm } from "@/components/search/site-search-form";
import { searchPublicContent } from "@/lib/global-search";
import {
  getMergedSearchSuggestions,
  recordSearchQuery,
} from "@/lib/search-analytics";
import { isSearchQueryValid } from "@/lib/search-utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return {
    title: t("metaTitle"),
    description: t("placeholder"),
    alternates: localeAlternates("/search"),
  };
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = getQueryValue(params.q).trim();
  const hasValidQuery = isSearchQueryValid(query);
  const [t, { queries: suggestedQueries, hasPopular }, results] =
    await Promise.all([
      getTranslations("search"),
      getMergedSearchSuggestions("public"),
      hasValidQuery ? searchPublicContent(query) : Promise.resolve([]),
    ]);

  if (hasValidQuery) {
    after(() => {
      void recordSearchQuery("public", query);
    });
  }

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <h1 className="page-header-title mb-2">{t("title")}</h1>
        <p className="mb-6 text-text/70">{t("placeholder")}</p>

        <SiteSearchForm
          action="/search"
          scope="public"
          defaultQuery={query}
          suggestedQueries={suggestedQueries}
          showPopularHint={hasPopular}
          placeholder={t("placeholder")}
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

        <p className="mt-8 text-center text-sm text-text/60">
          <Link
            href="/dashboard/search"
            className="font-medium text-primary hover:underline"
          >
            {t("dashboardLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
