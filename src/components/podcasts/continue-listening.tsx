import Link from "next/link";
import { Headphones, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { podcastsPageContent } from "@/lib/constants";
import {
  formatListenTime,
  type PodcastProgressSnapshot,
} from "@/lib/podcast-progress";

type ContinueListeningProps = {
  items: PodcastProgressSnapshot[];
};

export function ContinueListening({ items }: ContinueListeningProps) {
  if (items.length === 0) return null;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-heading">
            {podcastsPageContent.continueListening.title}
          </h2>
          <p className="text-sm text-text/70">
            {podcastsPageContent.continueListening.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const percent =
            item.durationSeconds > 0
              ? Math.min(
                  100,
                  Math.round((item.positionSeconds / item.durationSeconds) * 100)
                )
              : 0;

          return (
            <div
              key={item.podcastId}
              className="rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{item.title}</p>
                  <p className="mt-1 text-xs text-text/60 tabular-nums">
                    {formatListenTime(item.positionSeconds)} /{" "}
                    {formatListenTime(item.durationSeconds)}
                  </p>
                </div>
                <Link
                  href={`/podcasts/${item.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  <PlayCircle className="h-4 w-4" />
                  {podcastsPageContent.continueListening.resumeButton}
                </Link>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
