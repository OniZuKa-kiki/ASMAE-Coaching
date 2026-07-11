"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import {
  PodcastCard,
  type PodcastListItem,
} from "@/components/podcasts/podcast-card";
import { matchesArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

type PodcastCatalogProps = {
  podcasts: PodcastListItem[];
  favoriteKeys?: string[];
  signedIn?: boolean;
};

function matchesSearch(podcast: PodcastListItem, query: string) {
  if (!query) return true;
  const haystack = `${podcast.title} ${podcast.description}`;
  return matchesArabicSearch(haystack, query);
}

function sortPodcasts(
  items: PodcastListItem[],
  sort: string,
  collator: string
): PodcastListItem[] {
  const sorted = [...items];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "longest":
      return sorted.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
    case "shortest":
      return sorted.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, collator));
    default:
      return sorted.sort((a, b) => a.order - b.order);
  }
}

export function PodcastCatalog({
  podcasts,
  favoriteKeys = [],
  signedIn = false,
}: PodcastCatalogProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("podcasts");
  const tFilters = useTranslations("podcasts.filters");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("default");

  const query = search.trim();
  const isDefaultView = !query && type === "all" && sort === "default";
  const collator = locale === "fr" ? "fr" : "ar";

  const filteredPodcasts = useMemo(() => {
    let items = podcasts.filter((podcast) => matchesSearch(podcast, query));

    if (type === "free") {
      items = items.filter((podcast) => !podcast.isPremium);
    } else if (type === "premium") {
      items = items.filter((podcast) => podcast.isPremium);
    }

    return sortPodcasts(items, sort, collator);
  }, [podcasts, query, type, sort, collator]);

  const freePodcasts = filteredPodcasts.filter((podcast) => !podcast.isPremium);
  const premiumPodcasts = filteredPodcasts.filter((podcast) => podcast.isPremium);

  const resultsLabel =
    filteredPodcasts.length === 1
      ? tFilters("resultsOne")
      : tFilters("resultsMany", { count: filteredPodcasts.length });

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFilters("searchPlaceholder")}
        searchLabel={tFilters("searchLabel")}
        filters={[
          {
            id: "type",
            label: tFilters("typeLabel"),
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: tFilters("typeAll") },
              { value: "free", label: tFilters("typeFree") },
              { value: "premium", label: tFilters("typePremium") },
            ],
          },
          {
            id: "sort",
            label: tFilters("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "default", label: tFilters("sortDefault") },
              { value: "newest", label: tFilters("sortNewest") },
              { value: "oldest", label: tFilters("sortOldest") },
              { value: "longest", label: tFilters("sortLongest") },
              { value: "shortest", label: tFilters("sortShortest") },
              { value: "title", label: tFilters("sortTitle") },
            ],
          },
        ]}
        resultsCount={filteredPodcasts.length}
        resultsLabel={resultsLabel}
      />

      {filteredPodcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tFilters("noResults")}</p>
        </Card>
      ) : isDefaultView ? (
        <>
          {freePodcasts.length > 0 ? (
            <div className="mb-16">
              <SectionHeading
                title={t("freeSection.title")}
                subtitle={t("freeSection.subtitle")}
              />
              <div className="grid gap-6 md:grid-cols-2">
                {freePodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.slug}
                    podcast={podcast}
                    premiumBadge={t("premiumBadge")}
                    favoriteKeys={favoriteKeys}
                    signedIn={signedIn}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {premiumPodcasts.length > 0 ? (
            <div>
              <SectionHeading
                title={t("premiumSection.title")}
                subtitle={t("premiumSection.subtitle")}
              />
              <div className="grid gap-6 md:grid-cols-2">
                {premiumPodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.slug}
                    podcast={podcast}
                    premiumBadge={t("premiumBadge")}
                    favoriteKeys={favoriteKeys}
                    signedIn={signedIn}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPodcasts.map((podcast) => (
            <PodcastCard
              key={podcast.slug}
              podcast={podcast}
              premiumBadge={t("premiumBadge")}
              favoriteKeys={favoriteKeys}
              signedIn={signedIn}
            />
          ))}
        </div>
      )}
    </>
  );
}
