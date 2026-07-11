import "server-only";

import { subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { getTodayCheckInDate } from "@/lib/mood-check-in";
import {
  addTopicWeights,
  extractTopicsFromText,
  getCourseTopics,
  getPodcastTopics,
  getServiceTopics,
  getTopTopic,
  MOOD_TOPIC_WEIGHTS,
  normalizeMoodId,
  type JournalMoodId,
  type RecommendationTopic,
} from "@/lib/recommendation-topics";
import { getRecommendationClickSignals } from "@/lib/recommendation-clicks";

export type RecommendationReasonKey =
  | "moodToday"
  | "moodRecent"
  | "goal"
  | "intake"
  | "service"
  | "favorite"
  | "journal"
  | "similar"
  | "discover";

export type ContentRecommendationType = "course" | "podcast";

export type GetContentRecommendationsOptions = {
  limit?: number;
  type?: ContentRecommendationType | "all";
};

export type ContentRecommendation = {
  type: "course" | "podcast";
  id: string;
  slug: string;
  title: string;
  description: string;
  score: number;
  reasonKey: RecommendationReasonKey;
  topic: RecommendationTopic | null;
  isPremium?: boolean;
  duration?: number;
  href: string;
};

type RecommendationCandidate = ContentRecommendation & {
  reasonPriority: number;
};

type ClientSignals = {
  topicWeights: Partial<Record<RecommendationTopic, number>>;
  todayMood: JournalMoodId | null;
  topGoalTopic: RecommendationTopic | null;
  hasIntake: boolean;
  hasRecentJournal: boolean;
  serviceTopic: RecommendationTopic | null;
  favoriteTopics: RecommendationTopic[];
  enrolledCourseTopics: RecommendationTopic[];
  enrolledCourseIds: Set<string>;
  listenedPodcastIds: Set<string>;
  recentlyClickedEntityIds: Set<string>;
  favoriteCourseIds: Set<string>;
  favoritePodcastIds: Set<string>;
  premiumUnlocked: boolean;
};

const REASON_PRIORITY: Record<RecommendationReasonKey, number> = {
  moodToday: 6,
  service: 5,
  goal: 4,
  favorite: 4,
  intake: 3,
  journal: 3,
  moodRecent: 3,
  similar: 2,
  discover: 1,
};

function scoreContent(
  contentTopics: RecommendationTopic[],
  topicWeights: Partial<Record<RecommendationTopic, number>>
) {
  return contentTopics.reduce(
    (total, topic) => total + (topicWeights[topic] ?? 0),
    0
  );
}

function pickReason(
  candidateTopics: RecommendationTopic[],
  signals: ClientSignals
): { reasonKey: RecommendationReasonKey; topic: RecommendationTopic | null; priority: number } {
  const primaryTopic =
    candidateTopics.find((topic) => (signals.topicWeights[topic] ?? 0) > 0) ??
    getTopTopic(signals.topicWeights) ??
    candidateTopics[0] ??
    null;

  if (signals.todayMood && primaryTopic) {
    const moodTopics = MOOD_TOPIC_WEIGHTS[signals.todayMood];
    if (primaryTopic && (moodTopics[primaryTopic] ?? 0) > 0) {
      return {
        reasonKey: "moodToday",
        topic: primaryTopic,
        priority: REASON_PRIORITY.moodToday,
      };
    }
  }

  if (
    signals.serviceTopic &&
    primaryTopic &&
    candidateTopics.includes(signals.serviceTopic)
  ) {
    return {
      reasonKey: "service",
      topic: signals.serviceTopic,
      priority: REASON_PRIORITY.service,
    };
  }

  if (
    signals.topGoalTopic &&
    primaryTopic &&
    candidateTopics.includes(signals.topGoalTopic)
  ) {
    return {
      reasonKey: "goal",
      topic: signals.topGoalTopic,
      priority: REASON_PRIORITY.goal,
    };
  }

  if (
    signals.favoriteTopics.some((topic) => candidateTopics.includes(topic))
  ) {
    return {
      reasonKey: "favorite",
      topic:
        signals.favoriteTopics.find((topic) => candidateTopics.includes(topic)) ??
        primaryTopic,
      priority: REASON_PRIORITY.favorite,
    };
  }

  if (
    signals.enrolledCourseTopics.some((topic) => candidateTopics.includes(topic))
  ) {
    return {
      reasonKey: "similar",
      topic:
        signals.enrolledCourseTopics.find((topic) =>
          candidateTopics.includes(topic)
        ) ?? primaryTopic,
      priority: REASON_PRIORITY.similar,
    };
  }

  if (signals.hasRecentJournal && primaryTopic) {
    return {
      reasonKey: "journal",
      topic: primaryTopic,
      priority: REASON_PRIORITY.journal,
    };
  }

  if (signals.hasIntake && primaryTopic) {
    return {
      reasonKey: "intake",
      topic: primaryTopic,
      priority: REASON_PRIORITY.intake,
    };
  }

  if (signals.todayMood === null && getTopTopic(signals.topicWeights) && primaryTopic) {
    return {
      reasonKey: "moodRecent",
      topic: primaryTopic,
      priority: REASON_PRIORITY.moodRecent,
    };
  }

  if (primaryTopic) {
    return {
      reasonKey: "discover",
      topic: primaryTopic,
      priority: REASON_PRIORITY.discover,
    };
  }

  return {
    reasonKey: "discover",
    topic: null,
    priority: REASON_PRIORITY.discover,
  };
}

async function buildClientSignals(userId: string): Promise<ClientSignals> {
  const weekAgo = subDays(new Date(), 7);
  const topicWeights: Partial<Record<RecommendationTopic, number>> = {};

  const [
    todayMoodRow,
    recentMoods,
    goals,
    intake,
    recentBooking,
    favorites,
    enrollments,
    journalEntries,
    podcastProgress,
    clickSignals,
    hasPaidBooking,
    hasPaidCourse,
  ] = await Promise.all([
    prisma.moodCheckIn.findUnique({
      where: {
        userId_checkInDate: {
          userId,
          checkInDate: getTodayCheckInDate(),
        },
      },
    }),
    prisma.moodCheckIn.findMany({
      where: { userId, checkInDate: { gte: weekAgo } },
      orderBy: { checkInDate: "desc" },
      take: 7,
    }),
    prisma.goal.findMany({
      where: { userId, isCompleted: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.intakeForm.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findFirst({
      where: {
        userId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: { service: true },
      orderBy: { date: "desc" },
    }),
    prisma.favorite.findMany({
      where: {
        userId,
        entityType: { in: ["COURSE", "PODCAST"] },
      },
    }),
    prisma.courseEnrollment.findMany({
      where: { userId },
      select: {
        courseId: true,
        course: { select: { slug: true, title: true, description: true, topics: true } },
      },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.podcastListenProgress.findMany({
      where: { userId },
      select: {
        podcastId: true,
        positionSeconds: true,
        durationSeconds: true,
        podcast: { select: { slug: true, title: true, description: true, topics: true } },
      },
    }),
    getRecommendationClickSignals(userId),
    prisma.booking.count({
      where: {
        userId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
    prisma.payment.count({
      where: {
        userId,
        status: "PAID",
        courseId: { not: null },
      },
    }),
  ]);

  const todayMood = normalizeMoodId(todayMoodRow?.mood ?? null);
  if (todayMood) {
    for (const [topic, weight] of Object.entries(MOOD_TOPIC_WEIGHTS[todayMood])) {
      topicWeights[topic as RecommendationTopic] =
        (topicWeights[topic as RecommendationTopic] ?? 0) + (weight ?? 0) * 1.2;
    }
  }

  for (const mood of recentMoods) {
    const moodId = normalizeMoodId(mood.mood);
    if (!moodId) continue;
    for (const [topic, weight] of Object.entries(MOOD_TOPIC_WEIGHTS[moodId])) {
      topicWeights[topic as RecommendationTopic] =
        (topicWeights[topic as RecommendationTopic] ?? 0) + (weight ?? 0) * 0.35;
    }
  }

  let topGoalTopic: RecommendationTopic | null = null;
  for (const goal of goals) {
    const topics = extractTopicsFromText(`${goal.title} ${goal.description ?? ""}`);
    if (topics.length > 0 && !topGoalTopic) {
      topGoalTopic = topics[0];
    }
    addTopicWeights(topicWeights, topics, 2);
  }

  if (intake) {
    const intakeTopics = extractTopicsFromText(
      `${intake.goals} ${intake.challenges} ${intake.expectations}`
    );
    addTopicWeights(topicWeights, intakeTopics, 1.5);
  }

  let hasRecentJournal = false;
  for (const entry of journalEntries) {
    hasRecentJournal = true;
    const topics = extractTopicsFromText(entry.content);
    addTopicWeights(topicWeights, topics, 1.75);

    const moodId = normalizeMoodId(entry.mood);
    if (moodId) {
      for (const [topic, weight] of Object.entries(MOOD_TOPIC_WEIGHTS[moodId])) {
        topicWeights[topic as RecommendationTopic] =
          (topicWeights[topic as RecommendationTopic] ?? 0) + (weight ?? 0) * 0.5;
      }
    }
  }

  const enrolledCourseTopics: RecommendationTopic[] = [];
  for (const enrollment of enrollments) {
    const topics = getCourseTopics(enrollment.course.slug, enrollment.course.topics, {
      title: enrollment.course.title,
      description: enrollment.course.description,
    });
    enrolledCourseTopics.push(...topics);
    addTopicWeights(topicWeights, topics, 1.25);
  }

  const listenedPodcastIds = new Set<string>();
  for (const progress of podcastProgress) {
    listenedPodcastIds.add(progress.podcastId);
    const completionRatio =
      progress.durationSeconds > 0
        ? progress.positionSeconds / progress.durationSeconds
        : 0;
    const weight = completionRatio >= 0.85 ? 1.5 : 1;
    const topics = getPodcastTopics(
      progress.podcast.slug,
      progress.podcast.topics,
      {
        title: progress.podcast.title,
        description: progress.podcast.description,
      }
    );
    addTopicWeights(topicWeights, topics, weight);
  }

  for (const [topic, weight] of Object.entries(clickSignals.topicWeights)) {
    topicWeights[topic as RecommendationTopic] =
      (topicWeights[topic as RecommendationTopic] ?? 0) + (weight ?? 0);
  }

  const serviceTopic = recentBooking
    ? getServiceTopics(recentBooking.service.slug)[0] ?? null
    : null;
  if (recentBooking) {
    addTopicWeights(topicWeights, getServiceTopics(recentBooking.service.slug), 2.5);
  }

  const favoriteCourseIds = new Set<string>();
  const favoritePodcastIds = new Set<string>();
  const favoriteTopics: RecommendationTopic[] = [];

  const favoriteCourseEntityIds = favorites
    .filter((favorite) => favorite.entityType === "COURSE")
    .map((favorite) => favorite.entityId);
  const favoritePodcastEntityIds = favorites
    .filter((favorite) => favorite.entityType === "PODCAST")
    .map((favorite) => favorite.entityId);

  const [favoriteCourses, favoritePodcasts] = await Promise.all([
    favoriteCourseEntityIds.length > 0
      ? prisma.course.findMany({
          where: { id: { in: favoriteCourseEntityIds } },
          select: { id: true, slug: true, title: true, description: true, topics: true },
        })
      : Promise.resolve([]),
    favoritePodcastEntityIds.length > 0
      ? prisma.podcast.findMany({
          where: { id: { in: favoritePodcastEntityIds } },
          select: { id: true, slug: true, title: true, description: true, topics: true },
        })
      : Promise.resolve([]),
  ]);

  for (const course of favoriteCourses) {
    favoriteCourseIds.add(course.id);
    const topics = getCourseTopics(course.slug, course.topics, {
      title: course.title,
      description: course.description,
    });
    favoriteTopics.push(...topics);
    addTopicWeights(topicWeights, topics, 2);
  }

  for (const podcast of favoritePodcasts) {
    favoritePodcastIds.add(podcast.id);
    const topics = getPodcastTopics(podcast.slug, podcast.topics, {
      title: podcast.title,
      description: podcast.description,
    });
    favoriteTopics.push(...topics);
    addTopicWeights(topicWeights, topics, 2);
  }

  return {
    topicWeights,
    todayMood,
    topGoalTopic,
    hasIntake: Boolean(intake),
    hasRecentJournal,
    serviceTopic,
    favoriteTopics,
    enrolledCourseTopics,
    enrolledCourseIds: new Set(enrollments.map((item) => item.courseId)),
    listenedPodcastIds,
    recentlyClickedEntityIds: clickSignals.recentlyClickedEntityIds,
    favoriteCourseIds,
    favoritePodcastIds,
    premiumUnlocked: hasPaidBooking > 0 || hasPaidCourse > 0,
  };
}

function balanceRecommendations(
  items: RecommendationCandidate[],
  limit: number,
  type: GetContentRecommendationsOptions["type"] = "all"
): RecommendationCandidate[] {
  if (type === "course" || type === "podcast") {
    return items
      .filter((item) => item.type === type)
      .slice(0, limit);
  }

  const courses = items.filter((item) => item.type === "course");
  const podcasts = items.filter((item) => item.type === "podcast");

  if (courses.length === 0 || podcasts.length === 0) {
    return items.slice(0, limit);
  }

  const courseSlots = Math.max(1, Math.ceil(limit / 2));
  const podcastSlots = Math.max(1, limit - courseSlots);
  const selected = [...courses.slice(0, courseSlots), ...podcasts.slice(0, podcastSlots)];

  if (selected.length < limit) {
    const selectedIds = new Set(selected.map((item) => item.id));
    for (const item of items) {
      if (selected.length >= limit) break;
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
      }
    }
  }

  return selected
    .sort((a, b) => b.score - a.score || b.reasonPriority - a.reasonPriority)
    .slice(0, limit);
}

export async function getContentRecommendations(
  userId: string,
  options: GetContentRecommendationsOptions = {}
): Promise<ContentRecommendation[]> {
  const limit = options.limit ?? 4;
  const type = options.type ?? "all";
  const signals = await buildClientSignals(userId);

  const [courses, podcasts] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        topics: true,
      },
    }),
    prisma.podcast.findMany({
      where: {
        isPublished: true,
        ...(signals.premiumUnlocked ? {} : { isPremium: false }),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        isPremium: true,
        duration: true,
        topics: true,
      },
    }),
  ]);

  const candidates: RecommendationCandidate[] = [];

  for (const course of courses) {
    if (signals.enrolledCourseIds.has(course.id)) continue;
    if (signals.recentlyClickedEntityIds.has(course.id)) continue;

    const topics = getCourseTopics(course.slug, course.topics, {
      title: course.title,
      description: course.description,
    });
    const score = scoreContent(topics, signals.topicWeights);
    const reason = pickReason(topics, signals);

    candidates.push({
      type: "course",
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      score: score + reason.priority,
      reasonKey: reason.reasonKey,
      topic: reason.topic,
      href: `/courses/${course.slug}`,
      reasonPriority: reason.priority,
    });
  }

  for (const podcast of podcasts) {
    if (signals.listenedPodcastIds.has(podcast.id)) continue;
    if (signals.recentlyClickedEntityIds.has(podcast.id)) continue;

    const topics = getPodcastTopics(podcast.slug, podcast.topics, {
      title: podcast.title,
      description: podcast.description,
    });
    const score = scoreContent(topics, signals.topicWeights);
    const reason = pickReason(topics, signals);

    candidates.push({
      type: "podcast",
      id: podcast.id,
      slug: podcast.slug,
      title: podcast.title,
      description: podcast.description,
      score: score + reason.priority,
      reasonKey: reason.reasonKey,
      topic: reason.topic,
      isPremium: podcast.isPremium,
      duration: podcast.duration ?? undefined,
      href: `/podcasts/${podcast.slug}`,
      reasonPriority: reason.priority,
    });
  }

  if (candidates.every((item) => item.score <= REASON_PRIORITY.discover)) {
    for (const candidate of candidates) {
      candidate.score += candidate.type === "course" ? 0.5 : 0.25;
    }
  }

  const ranked = candidates.sort(
    (a, b) => b.score - a.score || b.reasonPriority - a.reasonPriority
  );

  return balanceRecommendations(ranked, limit, type).map(
    ({ reasonPriority: _reasonPriority, ...item }) => item
  );
}
