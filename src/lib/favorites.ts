import "server-only";

import type { FavoriteEntityType } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { formatPodcastDuration } from "@/lib/content-i18n";
import { prisma } from "@/lib/db";
import {
  favoriteKey,
  type FavoriteItem,
} from "@/lib/favorites-utils";
import {
  lessonResourceCategories,
  resolveLessonResourceCategory,
  type LessonResourceCategory,
} from "@/lib/resource-categories";
import { formatDate } from "@/lib/utils";
import { getRequestLocale } from "@/lib/request-locale";
import { intlLocale } from "@/lib/locale";

export type { FavoriteItem } from "@/lib/favorites-utils";

export async function getUserFavoriteKeysSet(
  userId: string
): Promise<Set<string>> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { entityType: true, entityId: true },
  });

  return new Set(rows.map((row) => favoriteKey(row.entityType, row.entityId)));
}

export async function getFavoriteKeysForCurrentUser(): Promise<Set<string>> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new Set();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return new Set();

  return getUserFavoriteKeysSet(user.id);
}

export async function toggleFavorite(
  userId: string,
  entityType: FavoriteEntityType,
  entityId: string
): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_entityType_entityId: { userId, entityType, entityId },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.favorite.create({
    data: { userId, entityType, entityId },
  });
  return true;
}

export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  const [locale, tc, tCourses] = await Promise.all([
    getRequestLocale(),
    getTranslations("dashboard.library.categories"),
    getTranslations("courses"),
  ]);
  const categoryLabels = Object.fromEntries(
    lessonResourceCategories.map((key) => [key, tc(key)])
  ) as Record<LessonResourceCategory, string>;
  const dateLocale = intlLocale(locale);

  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (rows.length === 0) return [];

  const byType = rows.reduce<Record<FavoriteEntityType, string[]>>(
    (acc, row) => {
      acc[row.entityType] = acc[row.entityType] ?? [];
      acc[row.entityType].push(row.entityId);
      return acc;
    },
    {} as Record<FavoriteEntityType, string[]>
  );

  const [courses, podcasts, posts, lessons] = await Promise.all([
    byType.COURSE?.length
      ? prisma.course.findMany({
          where: { id: { in: byType.COURSE } },
          select: { id: true, slug: true, title: true, description: true },
        })
      : Promise.resolve([]),
    byType.PODCAST?.length
      ? prisma.podcast.findMany({
          where: { id: { in: byType.PODCAST } },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            duration: true,
          },
        })
      : Promise.resolve([]),
    byType.BLOG_POST?.length
      ? prisma.blogPost.findMany({
          where: { id: { in: byType.BLOG_POST } },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            category: true,
            publishedAt: true,
          },
        })
      : Promise.resolve([]),
    byType.LESSON?.length
      ? prisma.courseLesson.findMany({
          where: { id: { in: byType.LESSON } },
          select: {
            id: true,
            title: true,
            resourceCategory: true,
            videoUrl: true,
            pdfUrl: true,
            module: {
              select: {
                title: true,
                course: { select: { id: true, title: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const courseMap = new Map(courses.map((item) => [item.id, item]));
  const podcastMap = new Map(podcasts.map((item) => [item.id, item]));
  const postMap = new Map(posts.map((item) => [item.id, item]));
  const lessonMap = new Map(lessons.map((item) => [item.id, item]));

  const items: FavoriteItem[] = [];

  for (const row of rows) {
    switch (row.entityType) {
      case "COURSE": {
        const course = courseMap.get(row.entityId);
        if (!course) continue;
        items.push({
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          title: course.title,
          description: course.description,
          href: `/courses/${course.slug}`,
          meta: tCourses("eyebrow"),
          createdAt: row.createdAt.toISOString(),
        });
        break;
      }
      case "PODCAST": {
        const podcast = podcastMap.get(row.entityId);
        if (!podcast) continue;
        items.push({
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          title: podcast.title,
          description: podcast.description,
          href: `/podcasts/${podcast.slug}`,
          meta: formatPodcastDuration(podcast.duration, locale),
          createdAt: row.createdAt.toISOString(),
        });
        break;
      }
      case "BLOG_POST": {
        const post = postMap.get(row.entityId);
        if (!post) continue;
        items.push({
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          title: post.title,
          description: post.excerpt,
          href: `/blog/${post.slug}`,
          meta: post.publishedAt
            ? `${post.category} · ${formatDate(post.publishedAt, dateLocale)}`
            : post.category,
          createdAt: row.createdAt.toISOString(),
        });
        break;
      }
      case "LESSON": {
        const lesson = lessonMap.get(row.entityId);
        if (!lesson) continue;
        const category = resolveLessonResourceCategory({
          resourceCategory: lesson.resourceCategory,
        });
        const categoryLabel = categoryLabels[category];
        items.push({
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          title: lesson.title,
          description: `${lesson.module.course.title} · ${lesson.module.title}`,
          href: `/dashboard/resources?course=${lesson.module.course.id}`,
          meta: categoryLabel,
          createdAt: row.createdAt.toISOString(),
        });
        break;
      }
    }
  }

  return items;
}
