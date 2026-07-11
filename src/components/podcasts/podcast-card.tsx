"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useLocale } from "next-intl";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatPodcastDuration } from "@/lib/content-i18n";
import { isFavorited } from "@/lib/favorites-utils";
import { PodcastThumbnail } from "@/components/podcasts/podcast-thumbnail";
import type { AppLocale } from "@/i18n/routing";

export type PodcastListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: number | null;
  isPremium: boolean;
  createdAt: string;
  order: number;
};

type PodcastCardProps = {
  podcast: PodcastListItem;
  premiumBadge: string;
  favoriteKeys?: string[];
  signedIn?: boolean;
};

export function PodcastCard({
  podcast,
  premiumBadge,
  favoriteKeys = [],
  signedIn = false,
}: PodcastCardProps) {
  const locale = useLocale() as AppLocale;

  return (
    <div className="relative">
      <FavoriteButton
        entityType="PODCAST"
        entityId={podcast.id}
        initialFavorited={isFavorited(favoriteKeys, "PODCAST", podcast.id)}
        signedIn={signedIn}
        className="absolute top-3 left-3 z-10"
      />
      <Link href={`/podcasts/${podcast.slug}`}>
        <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
          <div className="flex items-start gap-4">
            <PodcastThumbnail
              isPremium={podcast.isPremium}
              badgeLabel={premiumBadge}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">{podcast.title}</CardTitle>
              <CardDescription>{podcast.description}</CardDescription>
              <span className="mt-2 flex items-center gap-1 text-sm text-text/60">
                <Clock className="h-3 w-3 shrink-0" />
                {formatPodcastDuration(podcast.duration, locale)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
