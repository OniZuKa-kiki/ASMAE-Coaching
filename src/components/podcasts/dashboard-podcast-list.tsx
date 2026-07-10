"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatPodcastDuration } from "@/lib/content";
import { formatListenTime } from "@/lib/podcast-progress-client";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { PodcastThumbnail } from "@/components/podcasts/podcast-thumbnail";

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
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function DashboardPodcastList({
  podcasts,
  premiumUnlocked,
  lockedMessage,
}: DashboardPodcastListProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("title");

  const query = normalizeSearch(search);

  const filteredPodcasts = useMemo(() => {
    let items = podcasts.filter((podcast) => {
      if (!query) return true;
      const haystack = `${podcast.title} ${podcast.description}`.toLowerCase();
      return haystack.includes(query);
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
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
    }
  }, [podcasts, query, type, sort]);

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
        searchPlaceholder="ابحثي في الحلقات..."
        filters={[
          {
            id: "type",
            label: "النوع",
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: "جميع الحلقات" },
              { value: "free", label: "مجاني" },
              { value: "premium", label: "حصري" },
            ],
          },
          {
            id: "sort",
            label: "ترتيب العرض",
            value: sort,
            onChange: setSort,
            options: [
              { value: "title", label: "العنوان أ→ي" },
              { value: "longest", label: "الأطول مدة" },
              { value: "shortest", label: "الأقصر مدة" },
            ],
          },
        ]}
        resultsCount={filteredPodcasts.length}
        resultsLabel={
          filteredPodcasts.length === 1
            ? "حلقة واحدة"
            : `${filteredPodcasts.length} حلقات`
        }
      />

      {filteredPodcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">لا توجد حلقات تطابق البحث.</p>
        </Card>
      ) : (
        filteredPodcasts.map((podcast) => {
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
          <Card key={podcast.id}>
            <div className="flex items-start gap-4">
              <PodcastThumbnail isPremium={podcast.isPremium} badgeLabel="حصري" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-heading">{podcast.title}</p>
                <p className="mt-1 text-sm text-text/70">{podcast.description}</p>
                <p className="mt-2 text-xs text-text/60">
                  {formatPodcastDuration(podcast.duration)}
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
                  {hasProgress ? "متابعة الاستماع" : "فتح الحلقة"}
                </Link>
              </div>
            </div>
          </Card>
        );
        })
      )}
    </div>
  );
}
