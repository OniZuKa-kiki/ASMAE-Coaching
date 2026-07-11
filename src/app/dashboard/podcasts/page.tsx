import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getDashboardPodcasts } from "@/lib/dashboard";
import { DashboardPodcastList } from "@/components/podcasts/dashboard-podcast-list";
import { ContinueListening } from "@/components/podcasts/continue-listening";
import {
  getContinueListeningPodcasts,
  getPodcastProgressMapForUser,
} from "@/lib/podcast-progress";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getOrCreateUser } from "@/lib/user";
import { getUserFavoriteKeysSet } from "@/lib/favorites";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/podcasts",
    namespace: "dashboard.podcastsPage",
    titleKey: "pageTitle",
    descriptionKey: "subtitle",
  });
}

export default async function DashboardPodcastsPage() {
  const [user, t] = await Promise.all([
    getOrCreateUser(),
    getTranslations("dashboard.podcastsPage"),
  ]);

  const [data, continueListening, progressMap, favoriteKeys] = await Promise.all([
    getDashboardPodcasts(),
    getContinueListeningPodcasts(3),
    user ? getPodcastProgressMapForUser(user.id) : Promise.resolve(new Map()),
    user ? getUserFavoriteKeysSet(user.id) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("pageTitle")}</h1>
      <ContinueListening items={continueListening} />
      {!data || data.podcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{t("empty")}</p>
        </Card>
      ) : (
        <DashboardPodcastList
          podcasts={data.podcasts.map((podcast) => {
            const progress = progressMap.get(podcast.id);
            return {
              id: podcast.id,
              slug: podcast.slug,
              title: podcast.title,
              description: podcast.description,
              duration: podcast.duration,
              isPremium: podcast.isPremium,
              positionSeconds: progress?.positionSeconds,
              durationSeconds: progress?.durationSeconds,
            };
          })}
          premiumUnlocked={data.premiumUnlocked}
          lockedMessage={t("lockedMessage")}
          favoriteKeys={[...favoriteKeys]}
        />
      )}
    </div>
  );
}
