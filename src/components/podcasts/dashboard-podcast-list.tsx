"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import { formatPodcastDuration } from "@/lib/content-i18n";
import { formatListenTime } from "@/lib/podcast-progress-client";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { PodcastThumbnail } from "@/components/podcasts/podcast-thumbnail";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { isFavorited } from "@/lib/favorites-utils";
import { matchesArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

export type DashboardPodcastItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: number | null;
  isPremium: boolean;
  positionSeconds?: number;
  durationSeconds?: number;
};

type DashboardPodcastListProps = {
  podcasts: DashboardPodcastItem[];
  premiumUnlocked: boolean;
  lockedMessage: string;
  favoriteKeys?: string[];
};

export function DashboardPodcastList({
  podcasts,
  premiumUnlocked,
  lockedMessage,
  favoriteKeys = [],
}: DashboardPodcastListProps) {
  const locale = useLocale() as AppLocale;
  const tFilters = useTranslations("podcasts.filters");
  const tPodcasts = useTranslations("podcasts");
  const tPage = useTranslations("dashboard.podcastsPage");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("title");

  const query = search.trim();

  const filteredPodcasts = useMemo(() => {
    let items = podcasts.filter((podcast) => {
      if (!query) return true;
      const haystack = `${podcast.title} ${podcast.description}`;
      return matchesArabicSearch(haystack, query);
    });

    if (type === "free") {
      items = items.filter((podcast) => !podcast.isPremium);
    } else if (type === "premium") {
      items = items.filter((podcast) => podcast.isPremium);
    }

    const sorted = [...items];
    switch (sort) {
      case "longest":
        return sorted.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
      case "shortest":
        return sorted.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
      default:
        return sorted.sort((a, b) => a.title.localeCompare(b.title, locale));
    }
  }, [podcasts, query, type, sort, locale]);

  const resultsLabel =
    filteredPodcasts.length === 1
      ? tFilters("resultsOne")
      : tFilters("resultsMany", { count: filteredPodcasts.length });

  return (
    <div className="space-y-4">
      {!premiumUnlocked ? (
        <Card className="border-accent/30 bg-accent/10">
          <p className="text-sm text-heading">{lockedMessage}</p>
        </Card>
      ) : null}

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFilters("searchPlaceholder")}
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
              { value: "title", label: tFilters("sortTitle") },
              { value: "longest", label: tFilters("sortLongest") },
              { value: "shortest", label: tFilters("sortShortest") },
            ],
          },
        ]}
        resultsCount={filteredPodcasts.length}
        resultsLabel={resultsLabel}
      />

      <ListScrollHint
        count={filteredPodcasts.length}
        className="mb-3 text-end sm:text-start"
      />

      {filteredPodcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tFilters("noResults")}</p>
        </Card>
      ) : (
        <ScrollableItemList
          count={filteredPodcasts.length}
          stackGapClassName="space-y-4"
          maxHeightClassName="max-h-96 sm:max-h-[28rem]"
        >
          {filteredPodcasts.map((podcast) => {
            const hasProgress =
              (podcast.positionSeconds ?? 0) > 0 &&
              (podcast.durationSeconds ?? 0) > 0;
            const progressPercent = hasProgress
              ? Math.min(
                  100,
                  Math.round(
                    ((podcast.positionSeconds ?? 0) /
                      (podcast.durationSeconds ?? 1)) *
                      100
                  )
                )
              : 0;

            return (
              <Card key={podcast.id} className="relative">
                <FavoriteButton
                  entityType="PODCAST"
                  entityId={podcast.id}
                  initialFavorited={isFavorited(
                    favoriteKeys,
                    "PODCAST",
                    podcast.id
                  )}
                  signedIn
                  className="absolute top-3 left-3 z-10"
                />
                <div className="flex items-start gap-4">
                  <PodcastThumbnail
                    isPremium={podcast.isPremium}
                    badgeLabel={tPodcasts("premiumBadge")}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-heading">{podcast.title}</p>
                    <p className="mt-1 text-sm text-text/70">
                      {podcast.description}
                    </p>
                    <p className="mt-2 text-xs text-text/60">
                      {formatPodcastDuration(podcast.duration, locale)}
                      {hasProgress ? (
                        <span className="ms-2 tabular-nums text-primary">
                          · {formatListenTime(podcast.positionSeconds ?? 0)} /{" "}
                          {formatListenTime(podcast.durationSeconds ?? 0)}
                        </span>
                      ) : null}
                    </p>
                    {hasProgress ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    ) : null}
                    <Link
                      href={`/podcasts/${podcast.slug}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {hasProgress
                        ? tPodcasts("continueListening.title")
                        : tPage("openEpisode")}
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </ScrollableItemList>
      )}
    </div>
  );
}
