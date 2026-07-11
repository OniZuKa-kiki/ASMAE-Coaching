import "server-only";

import { subDays } from "date-fns";
import { prisma } from "@/lib/db";
import {
  getCourseTopics,
  getPodcastTopics,
  addTopicWeights,
  type RecommendationTopic,
} from "@/lib/recommendation-topics";
import type {
  RecommendationEntityType,
  RecommendationSource,
} from "@/lib/recommendation-types";

const RECENT_CLICK_EXCLUDE_DAYS = 7;
const CLICK_SIGNAL_DAYS = 30;

export type RecordRecommendationClickInput = {
  userId: string;
  entityType: RecommendationEntityType;
  entityId: string;
  source: RecommendationSource;
  reasonKey?: string | null;
};

export async function recordRecommendationClick(
  input: RecordRecommendationClickInput
) {
  await prisma.recommendationClick.create({
    data: {
      userId: input.userId,
      entityType: input.entityType as "COURSE" | "PODCAST",
      entityId: input.entityId,
      source: input.source as "DASHBOARD" | "COURSES" | "PODCASTS",
      reasonKey: input.reasonKey ?? null,
    },
  });
}

export async function getRecommendationClickSignals(userId: string) {
  const excludeSince = subDays(new Date(), RECENT_CLICK_EXCLUDE_DAYS);
  const signalSince = subDays(new Date(), CLICK_SIGNAL_DAYS);

  const clicks = await prisma.recommendationClick.findMany({
    where: { userId, createdAt: { gte: signalSince } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const recentlyClickedEntityIds = new Set<string>();
  const topicWeights: Partial<Record<RecommendationTopic, number>> = {};

  const recentEntityIds = clicks
    .filter((click) => click.createdAt >= excludeSince)
    .map((click) => click.entityId);

  for (const entityId of recentEntityIds) {
    recentlyClickedEntityIds.add(entityId);
  }

  const courseIds = [
    ...new Set(
      clicks
        .filter((click) => click.entityType === "COURSE")
        .map((click) => click.entityId)
    ),
  ];
  const podcastIds = [
    ...new Set(
      clicks
        .filter((click) => click.entityType === "PODCAST")
        .map((click) => click.entityId)
    ),
  ];

  const [courses, podcasts] = await Promise.all([
    courseIds.length > 0
      ? prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, slug: true, title: true, description: true, topics: true },
        })
      : Promise.resolve([]),
    podcastIds.length > 0
      ? prisma.podcast.findMany({
          where: { id: { in: podcastIds } },
          select: { id: true, slug: true, title: true, description: true, topics: true },
        })
      : Promise.resolve([]),
  ]);

  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const podcastMap = new Map(podcasts.map((podcast) => [podcast.id, podcast]));

  for (const click of clicks) {
    if (click.entityType === "COURSE") {
      const course = courseMap.get(click.entityId);
      if (!course) continue;
      addTopicWeights(
        topicWeights,
        getCourseTopics(course.slug, course.topics, {
          title: course.title,
          description: course.description,
        }),
        1.75
      );
      continue;
    }

    const podcast = podcastMap.get(click.entityId);
    if (!podcast) continue;
    addTopicWeights(
      topicWeights,
      getPodcastTopics(podcast.slug, podcast.topics, {
        title: podcast.title,
        description: podcast.description,
      }),
      1.75
    );
  }

  return { recentlyClickedEntityIds, topicWeights };
}
