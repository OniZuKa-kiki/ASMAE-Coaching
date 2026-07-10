import { addDays, addHours, startOfDay } from "date-fns";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatBookingDate } from "@/lib/booking";
import { getPendingSessionReview } from "@/lib/session-review";
import { formatDate } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  href?: string | null;
  dedupeKey: string;
};

export async function upsertNotification(input: CreateNotificationInput) {
  return prisma.notification.upsert({
    where: {
      userId_dedupeKey: {
        userId: input.userId,
        dedupeKey: input.dedupeKey,
      },
    },
    create: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      dedupeKey: input.dedupeKey,
    },
    update: {
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    },
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function getUserNotifications(
  userId: string,
  limit = 50
): Promise<NotificationItem[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

export async function syncUserNotifications(userId: string): Promise<void> {
  const now = new Date();
  const reminderUntil = addHours(now, 48);
  const goalUntil = addDays(now, 7);

  const [upcomingBookings, pendingReview, upcomingGoals, podcastProgress] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          userId,
          status: "CONFIRMED",
          date: { gte: startOfDay(now), lte: reminderUntil },
        },
        include: { service: true },
      }),
      getPendingSessionReview(userId),
      prisma.goal.findMany({
        where: {
          userId,
          isCompleted: false,
          targetDate: { gte: startOfDay(now), lte: goalUntil },
        },
      }),
      prisma.podcastListenProgress.findMany({
        where: { userId, positionSeconds: { gt: 30 } },
        include: { podcast: true },
      }),
    ]);

  const activeDedupeKeys = new Set<string>();

  for (const booking of upcomingBookings) {
    const dedupeKey = `booking-reminder:${booking.id}`;
    activeDedupeKeys.add(dedupeKey);
    await upsertNotification({
      userId,
      type: "BOOKING_REMINDER",
      dedupeKey,
      title: "جلسة قادمة قريباً",
      body: `${booking.service.title} — ${formatBookingDate(booking.date)} في ${booking.startTime}`,
      href: "/dashboard/bookings",
    });
  }

  if (pendingReview) {
    const dedupeKey = `session-review:${pendingReview.id}`;
    activeDedupeKeys.add(dedupeKey);
    await upsertNotification({
      userId,
      type: "SESSION_REVIEW",
      dedupeKey,
      title: "قيّمي جلستكِ الأخيرة",
      body: pendingReview.service.title,
      href: "/dashboard/bookings",
    });
  }

  for (const goal of upcomingGoals) {
    const dedupeKey = `goal-deadline:${goal.id}`;
    activeDedupeKeys.add(dedupeKey);
    await upsertNotification({
      userId,
      type: "GOAL_DEADLINE",
      dedupeKey,
      title: "موعد هدف يقترب",
      body: `${goal.title} — ${goal.targetDate ? formatDate(goal.targetDate) : ""}`,
      href: "/dashboard/goals",
    });
  }

  for (const progress of podcastProgress) {
    const duration = progress.durationSeconds ?? progress.podcast.duration ?? 0;
    const nearEnd =
      duration > 0 && progress.positionSeconds >= duration - 30;
    if (nearEnd) continue;

    const dedupeKey = `podcast-continue:${progress.podcastId}`;
    activeDedupeKeys.add(dedupeKey);
    await upsertNotification({
      userId,
      type: "PODCAST_CONTINUE",
      dedupeKey,
      title: "تابعي الاستماع",
      body: progress.podcast.title,
      href: `/podcasts/${progress.podcast.slug}`,
    });
  }

  const syncPrefixes = [
    "booking-reminder:",
    "session-review:",
    "goal-deadline:",
    "podcast-continue:",
  ];

  const stale = await prisma.notification.findMany({
    where: {
      userId,
      type: {
        in: [
          "BOOKING_REMINDER",
          "SESSION_REVIEW",
          "GOAL_DEADLINE",
          "PODCAST_CONTINUE",
        ],
      },
    },
    select: { id: true, dedupeKey: true },
  });

  const staleIds = stale
    .filter(
      (item) =>
        syncPrefixes.some((prefix) => item.dedupeKey.startsWith(prefix)) &&
        !activeDedupeKeys.has(item.dedupeKey)
    )
    .map((item) => item.id);

  if (staleIds.length > 0) {
    await prisma.notification.deleteMany({
      where: { id: { in: staleIds }, userId },
    });
  }
}

export async function notifyBookingConfirmed(params: {
  userId: string;
  bookingId: string;
  serviceTitle: string;
  date: Date;
  time: string;
}) {
  await upsertNotification({
    userId: params.userId,
    type: "BOOKING_CONFIRMED",
    dedupeKey: `booking-confirmed:${params.bookingId}`,
    title: "تم تأكيد جلستكِ",
    body: `${params.serviceTitle} — ${formatBookingDate(params.date)} في ${params.time}`,
    href: "/dashboard/bookings",
  });
}

export async function notifyCoursePurchase(params: {
  userId: string;
  paymentId: string;
  courseId: string;
  courseTitle: string;
}) {
  await upsertNotification({
    userId: params.userId,
    type: "COURSE_PURCHASE",
    dedupeKey: `course-purchase:${params.paymentId}`,
    title: "دورتكِ جاهزة",
    body: params.courseTitle,
    href: `/dashboard/resources?course=${params.courseId}`,
  });
}

export async function notifySessionReview(params: {
  userId: string;
  bookingId: string;
  serviceTitle: string;
}) {
  await upsertNotification({
    userId: params.userId,
    type: "SESSION_REVIEW",
    dedupeKey: `session-review:${params.bookingId}`,
    title: "قيّمي جلستكِ",
    body: params.serviceTitle,
    href: "/dashboard/bookings",
  });
}
