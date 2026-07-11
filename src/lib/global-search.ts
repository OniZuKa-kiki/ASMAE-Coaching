import "server-only";

import { prisma } from "@/lib/db";
import { getRequestLocale } from "@/lib/request-locale";
import { getSearchMetaCopy } from "@/lib/search-meta-i18n";
import {
  filterByArabicSearch,
  isSearchQueryValid,
  type SearchResultItem,
} from "@/lib/search-utils";

const PER_TYPE_LIMIT = 6;

export async function searchPublicContent(
  rawQuery: string
): Promise<SearchResultItem[]> {
  if (!isSearchQueryValid(rawQuery.trim())) return [];

  const locale = await getRequestLocale();
  const meta = getSearchMetaCopy(locale);

  const [services, courses, posts, podcasts] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.podcast.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const matchedServices = filterByArabicSearch(services, rawQuery, [
    (service) => service.title,
    (service) => service.description,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedCourses = filterByArabicSearch(courses, rawQuery, [
    (course) => course.title,
    (course) => course.description,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedPosts = filterByArabicSearch(posts, rawQuery, [
    (post) => post.title,
    (post) => post.excerpt,
    (post) => post.category,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedPodcasts = filterByArabicSearch(podcasts, rawQuery, [
    (podcast) => podcast.title,
    (podcast) => podcast.description,
  ]).slice(0, PER_TYPE_LIMIT);

  return [
    ...matchedServices.map((service) => ({
      id: service.id,
      type: "SERVICE" as const,
      title: service.title,
      description: service.description,
      href: `/services/${service.slug}`,
      meta: meta.service,
    })),
    ...matchedCourses.map((course) => ({
      id: course.id,
      type: "COURSE" as const,
      title: course.title,
      description: course.description,
      href: `/courses/${course.slug}`,
      meta: meta.course,
    })),
    ...matchedPodcasts.map((podcast) => ({
      id: podcast.id,
      type: "PODCAST" as const,
      title: podcast.title,
      description: podcast.description,
      href: `/podcasts/${podcast.slug}`,
      meta: podcast.isPremium ? meta.podcastPremium : meta.podcast,
    })),
    ...matchedPosts.map((post) => ({
      id: post.id,
      type: "BLOG_POST" as const,
      title: post.title,
      description: post.excerpt,
      href: `/blog/${post.slug}`,
      meta: post.category,
    })),
  ];
}

export async function searchDashboardContent(
  userId: string,
  rawQuery: string
): Promise<SearchResultItem[]> {
  if (!isSearchQueryValid(rawQuery.trim())) return [];

  const locale = await getRequestLocale();
  const meta = getSearchMetaCopy(locale);

  const [publicResults, goals, journalEntries, bookings, lessons] =
    await Promise.all([
      searchPublicContent(rawQuery),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: { userId },
        include: { service: true },
        orderBy: { date: "desc" },
      }),
      prisma.courseLesson.findMany({
        where: {
          module: {
            course: {
              enrollments: { some: { userId } },
            },
          },
        },
        include: {
          module: {
            select: {
              title: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { title: "asc" },
      }),
    ]);

  const matchedGoals = filterByArabicSearch(goals, rawQuery, [
    (goal) => goal.title,
    (goal) => goal.description,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedJournal = filterByArabicSearch(journalEntries, rawQuery, [
    (entry) => entry.content,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedBookings = filterByArabicSearch(bookings, rawQuery, [
    (booking) => booking.service.title,
    (booking) => booking.service.description,
    (booking) => booking.notes,
  ]).slice(0, PER_TYPE_LIMIT);

  const matchedLessons = filterByArabicSearch(lessons, rawQuery, [
    (lesson) => lesson.title,
    (lesson) => lesson.module.title,
    (lesson) => lesson.module.course.title,
  ]).slice(0, PER_TYPE_LIMIT);

  const privateResults: SearchResultItem[] = [
    ...matchedGoals.map((goal) => ({
      id: goal.id,
      type: "GOAL" as const,
      title: goal.title,
      description: goal.description,
      href: `/dashboard/goals/${goal.id}/edit`,
      meta: goal.isCompleted ? meta.goalCompleted : meta.goalActive,
    })),
    ...matchedJournal.map((entry) => ({
      id: entry.id,
      type: "JOURNAL" as const,
      title: entry.content.slice(0, 80) + (entry.content.length > 80 ? "…" : ""),
      description: entry.content,
      href: `/dashboard/journal/${entry.id}/edit`,
      meta: meta.journal,
    })),
    ...matchedBookings.map((booking) => ({
      id: booking.id,
      type: "BOOKING" as const,
      title: booking.service.title,
      description: booking.notes,
      href: "/dashboard/bookings",
      meta: meta.booking,
    })),
    ...matchedLessons.map((lesson) => ({
      id: lesson.id,
      type: "LESSON" as const,
      title: lesson.title,
      description: `${lesson.module.course.title} · ${lesson.module.title}`,
      href: `/dashboard/resources?course=${lesson.module.course.id}`,
      meta: meta.lesson,
    })),
  ];

  return [...privateResults, ...publicResults];
}

const SUGGESTION_LIMIT = 6;

export type SearchSuggestion = {
  id: string;
  title: string;
  meta: string | null;
  href: string;
};

export async function suggestPublicContent(
  rawQuery: string
): Promise<SearchSuggestion[]> {
  const results = await searchPublicContent(rawQuery);
  return results.slice(0, SUGGESTION_LIMIT).map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.meta,
    href: item.href,
  }));
}

export async function suggestDashboardContent(
  userId: string,
  rawQuery: string
): Promise<SearchSuggestion[]> {
  const results = await searchDashboardContent(userId, rawQuery);
  return results.slice(0, SUGGESTION_LIMIT).map((item) => ({
    id: item.id,
    title: item.title,
    meta: item.meta,
    href: item.href,
  }));
}
