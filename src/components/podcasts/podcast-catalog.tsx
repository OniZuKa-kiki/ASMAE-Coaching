"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { podcastsPageContent } from "@/lib/constants";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import {
  PodcastCard,
  type PodcastListItem,
} from "@/components/podcasts/podcast-card";

type PodcastCatalogProps = {
  podcasts: PodcastListItem[];
};

const filters = podcastsPageContent.filters;

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(podcast: PodcastListItem, query: string) {
  if (!query) return true;
  const haystack = `${podcast.title} ${podcast.description}`.toLowerCase();
  return haystack.includes(query);
}

function sortPodcasts(
  items: PodcastListItem[],
  sort: string
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
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
    default:
      return sorted.sort((a, b) => a.order - b.order);
  }
}

export function PodcastCatalog({ podcasts }: PodcastCatalogProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("default");

  const query = normalizeSearch(search);
  const isDefaultView = !query && type === "all" && sort === "default";

  const filteredPodcasts = useMemo(() => {
    let items = podcasts.filter((podcast) => matchesSearch(podcast, query));

    if (type === "free") {
      items = items.filter((podcast) => !podcast.isPremium);
    } else if (type === "premium") {
      items = items.filter((podcast) => podcast.isPremium);
    }

    return sortPodcasts(items, sort);
  }, [podcasts, query, type, sort]);

  const freePodcasts = filteredPodcasts.filter((podcast) => !podcast.isPremium);
  const premiumPodcasts = filteredPodcasts.filter((podcast) => podcast.isPremium);

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={filters.searchPlaceholder}
        searchLabel={filters.searchLabel}
        filters={[
          {
            id: "type",
            label: filters.typeLabel,
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: filters.typeAll },
              { value: "free", label: filters.typeFree },
              { value: "premium", label: filters.typePremium },
            ],
          },
          {
            id: "sort",
            label: filters.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "default", label: filters.sortDefault },
              { value: "newest", label: filters.sortNewest },
              { value: "oldest", label: filters.sortOldest },
              { value: "longest", label: filters.sortLongest },
              { value: "shortest", label: filters.sortShortest },
              { value: "title", label: filters.sortTitle },
            ],
          },
        ]}
        resultsCount={filteredPodcasts.length}
        resultsLabel={filters.resultsCount(filteredPodcasts.length)}
      />

      {filteredPodcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{filters.noResults}</p>
        </Card>
      ) : isDefaultView ? (
        <>
          {freePodcasts.length > 0 ? (
            <div className="mb-16">
              <SectionHeading
                title={podcastsPageContent.freeSection.title}
                subtitle={podcastsPageContent.freeSection.subtitle}
              />
              <div className="grid gap-6 md:grid-cols-2">
                {freePodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.slug}
                    podcast={podcast}
                    premiumBadge={podcastsPageContent.premiumBadge}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {premiumPodcasts.length > 0 ? (
            <div>
              <SectionHeading
                title={podcastsPageContent.premiumSection.title}
                subtitle={podcastsPageContent.premiumSection.subtitle}
              />
              <div className="grid gap-6 md:grid-cols-2">
                {premiumPodcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.slug}
                    podcast={podcast}
                    premiumBadge={podcastsPageContent.premiumBadge}
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
              premiumBadge={podcastsPageContent.premiumBadge}
            />
          ))}
        </div>
      )}
    </>
  );
}
