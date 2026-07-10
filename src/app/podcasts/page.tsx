import type { Metadata } from "next";
import { podcastsPageContent } from "@/lib/constants";
import { getPublishedPodcasts } from "@/lib/content";
import { PodcastCatalog } from "@/components/podcasts/podcast-catalog";

export const metadata: Metadata = {
  title: podcastsPageContent.title,
  description: podcastsPageContent.subtitle,
};

export default async function PodcastsPage() {
  const podcasts = await getPublishedPodcasts();
  const items = podcasts.map((podcast, order) => ({
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
          <h1 className="page-title mb-6">{podcastsPageContent.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {podcastsPageContent.subtitle}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <PodcastCatalog podcasts={items} />
        </div>
      </section>
    </>
  );
}
