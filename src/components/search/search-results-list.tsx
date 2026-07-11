import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import {
  groupSearchResults,
  type SearchResultItem,
  type SearchResultType,
} from "@/lib/search-utils";

type SearchResultsListProps = {
  results: SearchResultItem[];
};

export async function SearchResultsList({ results }: SearchResultsListProps) {
  const t = await getTranslations("search");
  const groups = groupSearchResults(results);

  const resultsLabel =
    results.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: results.length });

  return (
    <div className="space-y-8">
      <p className="text-sm text-text/70">{resultsLabel}</p>

      {groups.map((group) => (
        <section key={group.type}>
          <h2 className="mb-4 font-heading text-lg font-semibold text-heading">
            {t(`sections.${group.type as SearchResultType}`)} ({group.items.length})
          </h2>
          <div className="space-y-3">
            {group.items.map((item) => (
              <Card key={`${group.type}-${item.id}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-primary">{item.meta}</p>
                    <h3 className="mt-1 font-semibold text-heading">{item.title}</h3>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-text/70">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    {t("open")}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
