import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Lock } from "lucide-react";
import { AudioPlayer } from "@/components/podcasts/audio-player";
import { podcastsPageContent } from "@/lib/constants";
import {
  formatPodcastDuration,
  getPodcastBySlug,
  getPublishedPodcasts,
} from "@/lib/content";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/db";
import { getPodcastProgressBySlug } from "@/lib/podcast-progress";

export async function generateStaticParams() {
  const podcasts = await getPublishedPodcasts();
  return podcasts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) return { title: "البودكاست غير موجود" };
  return { title: podcast.title, description: podcast.description };
}

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();
  const user = await getOrCreateUser();

  const canAccessPremium = !podcast.isPremium
    ? true
    : Boolean(
        user &&
          ((await prisma.booking.count({
            where: {
              userId: user.id,
              status: { in: ["CONFIRMED", "COMPLETED"] },
            },
          })) > 0 ||
            (await prisma.payment.count({
              where: {
                userId: user.id,
                status: "PAID",
                courseId: { not: null },
              },
            })) > 0)
      );

  const progress =
    user && canAccessPremium
      ? await getPodcastProgressBySlug(slug, user.id)
      : null;

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        {podcast.isPremium && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-6">
            <Lock className="w-4 h-4" />
            {podcastsPageContent.premiumContentLabel}
          </span>
        )}
        <h1 className="font-heading text-4xl font-semibold text-heading mb-4">
          {podcast.title}
        </h1>
        <p className="text-text/70 flex items-center gap-2 mb-8">
          <Clock className="w-4 h-4" />
          {formatPodcastDuration(podcast.duration)}
        </p>
        <p className="text-text text-lg mb-10">{podcast.description}</p>

        <div className="rounded-[20px] bg-card border border-border/50 p-8">
          {!canAccessPremium ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
              <p className="text-heading font-semibold mb-2">
                {podcastsPageContent.premiumLockedTitle}
              </p>
              <p className="text-text/70 text-sm">
                {podcastsPageContent.premiumLockedMessage}
              </p>
            </div>
          ) : podcast.audioUrl ? (
            <AudioPlayer
              src={podcast.audioUrl}
              title={podcast.title}
              podcastSlug={slug}
              initialPosition={progress?.positionSeconds ?? 0}
              persistProgress={Boolean(user)}
            />
          ) : (
            <p className="text-center text-text/70 py-8">
              {podcastsPageContent.audioComingSoon}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
