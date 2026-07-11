import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { getPublishedPodcasts } from "@/lib/content";
import { PodcastCatalog } from "@/components/podcasts/podcast-catalog";
import { ContentRecommendations } from "@/components/dashboard/content-recommendations";
import { getFavoriteKeysForCurrentUser } from "@/lib/favorites";
import { toIsoString } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("podcasts");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/podcasts"),
  };
}

export default async function PodcastsPage() {
  const [podcasts, favoriteKeys, { userId }, t] = await Promise.all([
    getPublishedPodcasts(),
    getFavoriteKeysForCurrentUser(),
    auth(),
    getTranslations("podcasts"),
  ]);
  const items = podcasts.map((podcast, order) => ({
    id: podcast.id,
    slug: podcast.slug,
    title: podcast.title,
    description: podcast.description,
    duration: podcast.duration,
    isPremium: podcast.isPremium,
    createdAt: toIsoString(podcast.createdAt) ?? "",
    order,
  }));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
        {userId ? (
          <ContentRecommendations
            type="podcast"
            limit={2}
            showCatalogLinks={false}
            source="PODCASTS"
            className="mb-10"
          />
        ) : null}
        <PodcastCatalog
          podcasts={items}
          favoriteKeys={[...favoriteKeys]}
          signedIn={!!userId}
        />
      </ContentSection>
    </>
  );
}
