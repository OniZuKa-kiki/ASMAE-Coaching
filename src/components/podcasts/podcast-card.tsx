import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPodcastDuration } from "@/lib/content";
import { PodcastThumbnail } from "@/components/podcasts/podcast-thumbnail";

export type PodcastListItem = {
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
};

export function PodcastCard({ podcast, premiumBadge }: PodcastCardProps) {
  return (
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
              {formatPodcastDuration(podcast.duration)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
