import "server-only";

import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";
import {
  isPodcastProgressResumable,
  type PodcastProgressSnapshot,
} from "@/lib/podcast-progress-utils";

export {
  formatListenTime,
  isPodcastProgressResumable,
  type PodcastProgressSnapshot,
} from "@/lib/podcast-progress-utils";

export async function getPodcastProgressBySlug(
  slug: string,
  userId: string
): Promise<PodcastProgressSnapshot | null> {
  const row = await prisma.podcastListenProgress.findFirst({
    where: { userId, podcast: { slug } },
    include: { podcast: true },
  });

  if (!row) return null;

  return {
    podcastId: row.podcastId,
    slug: row.podcast.slug,
    title: row.podcast.title,
    positionSeconds: row.positionSeconds,
    durationSeconds: row.durationSeconds,
    updatedAt: row.updatedAt,
  };
}

export async function upsertPodcastProgress(input: {
  userId: string;
  podcastId: string;
  positionSeconds: number;
  durationSeconds: number;
}) {
  const positionSeconds = Math.max(0, input.positionSeconds);
  const durationSeconds = Math.max(0, input.durationSeconds);

  return prisma.podcastListenProgress.upsert({
    where: {
      userId_podcastId: {
        userId: input.userId,
        podcastId: input.podcastId,
      },
    },
    create: {
      userId: input.userId,
      podcastId: input.podcastId,
      positionSeconds,
      durationSeconds,
    },
    update: {
      positionSeconds,
      durationSeconds,
    },
  });
}

export async function getContinueListeningPodcasts(
  limit = 3
): Promise<PodcastProgressSnapshot[]> {
  const user = await getOrCreateUser();
  if (!user) return [];

  const rows = await prisma.podcastListenProgress.findMany({
    where: { userId: user.id },
    include: { podcast: true },
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  return rows
    .filter((row) =>
      isPodcastProgressResumable(row.positionSeconds, row.durationSeconds)
    )
    .slice(0, limit)
    .map((row) => ({
      podcastId: row.podcastId,
      slug: row.podcast.slug,
      title: row.podcast.title,
      positionSeconds: row.positionSeconds,
      durationSeconds: row.durationSeconds,
      updatedAt: row.updatedAt,
    }));
}

export async function getPodcastProgressMapForUser(userId: string) {
  const rows = await prisma.podcastListenProgress.findMany({
    where: { userId },
    select: {
      podcastId: true,
      positionSeconds: true,
      durationSeconds: true,
    },
  });

  return new Map(
    rows.map((row) => [
      row.podcastId,
      {
        positionSeconds: row.positionSeconds,
        durationSeconds: row.durationSeconds,
      },
    ])
  );
}

export async function getPodcastIdBySlug(slug: string) {
  return prisma.podcast.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });
}
