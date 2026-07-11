import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { getPublishedPodcasts } from "@/lib/content";
import { PodcastCatalog } from "@/components/podcasts/podcast-catalog";
import { ContentRecommendations } from "@/components/dashboard/content-recommendations";
import { getFavoriteKeysForCurrentUser } from "@/lib/favorites";

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
    createdAt: podcast.createdAt.toISOString(),
    order,
  }));

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
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
        </div>
      </section>
    </>
  );
}
