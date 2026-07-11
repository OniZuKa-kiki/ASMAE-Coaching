import "server-only";

import { format, startOfDay, subDays } from "date-fns";
import { getUserEnrollments } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { getJournalMoodDisplay } from "@/lib/journal-moods-i18n";
import { getRequestLocale } from "@/lib/request-locale";
import type { PodcastProgressSnapshot } from "@/lib/podcast-progress-utils";
import {
  getContinueListeningPodcasts,
} from "@/lib/podcast-progress";
import { getOrCreateUser } from "@/lib/user";

export type JourneyMoodDay = {
  dateKey: string;
  dateLabel: string;
  emoji: string | null;
  label: string | null;
};

export type JourneyMilestone = {
  id: string;
  done: boolean;
  href: string;
};

export type JourneyCourseProgress = {
  id: string;
  slug: string;
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
};

export type JourneyGoalItem = {
  id: string;
  title: string;
  progress: number;
  isCompleted: boolean;
  targetDate: string | null;
};

export type JourneyJournalPreview = {
  id: string;
  preview: string;
  moodEmoji: string | null;
  moodLabel: string | null;
  createdAt: string;
};

export type JourneyNextBooking = {
  id: string;
  serviceTitle: string;
  dateLabel: string;
  startTime: string;
  meetingUrl: string | null;
};

export type UserJourneyData = {
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  summary: {
    completedSessions: number;
    upcomingSessions: number;
    coursesEnrolled: number;
    coursesInProgress: number;
    coursesCompleted: number;
    activeGoals: number;
    completedGoals: number;
    journalEntries: number;
    moodStreak: number;
    favoritesCount: number;
  };
  nextBooking: JourneyNextBooking | null;
  courses: JourneyCourseProgress[];
  goals: JourneyGoalItem[];
  moodWeek: JourneyMoodDay[];
  recentJournal: JourneyJournalPreview[];
  continuePodcasts: PodcastProgressSnapshot[];
  milestones: JourneyMilestone[];
};

function truncatePreview(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

function computeMoodStreak(
  checkInDates: Date[],
  today = startOfDay(new Date())
): number {
  const dateKeys = new Set(
    checkInDates.map((date) => format(startOfDay(date), "yyyy-MM-dd"))
  );

  let streak = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const key = format(subDays(today, offset), "yyyy-MM-dd");
    if (!dateKeys.has(key)) break;
    streak += 1;
  }

  return streak;
}

export async function getUserJourneyData(): Promise<UserJourneyData | null> {
  const locale = await getRequestLocale();
  const user = await getOrCreateUser();
  if (!user) return null;

  const now = new Date();
  const today = startOfDay(now);
  const weekStart = subDays(today, 6);
  const streakStart = subDays(today, 29);

  const [
    enrollments,
    continuePodcasts,
    nextBooking,
    completedSessions,
    upcomingSessions,
    allGoals,
    journalRecent,
    journalCount,
    moodWeekRows,
    moodStreakRows,
    intakeForm,
    favoritesCount,
    hasPaidCourse,
  ] = await Promise.all([
    getUserEnrollments(),
    getContinueListeningPodcasts(3),
    prisma.booking.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        date: { gte: now },
      },
      include: { service: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.booking.count({
      where: {
        userId: user.id,
        OR: [
          { status: "COMPLETED" },
          { status: "CONFIRMED", date: { lt: now } },
        ],
      },
    }),
    prisma.booking.count({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        date: { gte: now },
      },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: [{ isCompleted: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.moodCheckIn.findMany({
      where: {
        userId: user.id,
        checkInDate: { gte: weekStart },
      },
      orderBy: { checkInDate: "asc" },
    }),
    prisma.moodCheckIn.findMany({
      where: {
        userId: user.id,
        checkInDate: { gte: streakStart },
      },
      select: { checkInDate: true },
    }),
    prisma.intakeForm.findFirst({ where: { userId: user.id } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.payment.count({
      where: { userId: user.id, status: "PAID", courseId: { not: null } },
    }),
  ]);

  const enrolled = enrollments ?? [];
  const coursesInProgress = enrolled.filter(
    (item) => item.progressAuto > 0 && item.progressAuto < 100
  ).length;
  const coursesCompleted = enrolled.filter(
    (item) => item.totalLessons > 0 && item.progressAuto >= 100
  ).length;
  const activeGoals = allGoals.filter((goal) => !goal.isCompleted);
  const completedGoals = allGoals.filter((goal) => goal.isCompleted);

  const moodByDate = new Map(
    moodWeekRows.map((row) => [
      format(startOfDay(row.checkInDate), "yyyy-MM-dd"),
      row,
    ])
  );

  const moodWeek: JourneyMoodDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(today, 6 - index);
    const dateKey = format(date, "yyyy-MM-dd");
    const row = moodByDate.get(dateKey);
    const display = row ? getJournalMoodDisplay(row.mood, locale) : null;

    return {
      dateKey,
      dateLabel: format(date, "EEE d"),
      emoji: display?.emoji ?? null,
      label: display?.label ?? null,
    };
  });

  const courses: JourneyCourseProgress[] = enrolled
    .filter((item) => item.totalLessons > 0)
    .sort((a, b) => b.progressAuto - a.progressAuto)
    .slice(0, 4)
    .map((item) => ({
      id: item.courseId,
      slug: item.course.slug,
      title: item.course.title,
      progress: item.progressAuto,
      completedLessons: item.completedLessons,
      totalLessons: item.totalLessons,
    }));

  const goals: JourneyGoalItem[] = activeGoals.slice(0, 4).map((goal) => ({
    id: goal.id,
    title: goal.title,
    progress: goal.progress,
    isCompleted: goal.isCompleted,
    targetDate: goal.targetDate?.toISOString() ?? null,
  }));

  const recentJournal: JourneyJournalPreview[] = journalRecent.map((entry) => {
    const display = getJournalMoodDisplay(entry.mood, locale);
    return {
      id: entry.id,
      preview: truncatePreview(entry.content),
      moodEmoji: display?.emoji ?? null,
      moodLabel: display?.label ?? null,
      createdAt: entry.createdAt.toISOString(),
    };
  });

  const milestones: JourneyMilestone[] = [
    {
      id: "intake",
      done: Boolean(intakeForm),
      href: "/dashboard/settings",
    },
    {
      id: "session",
      done: completedSessions > 0 || upcomingSessions > 0,
      href: "/booking",
    },
    {
      id: "mood",
      done: moodStreakRows.length > 0,
      href: "/dashboard",
    },
    {
      id: "journal",
      done: journalCount > 0,
      href: "/dashboard/journal",
    },
    {
      id: "course",
      done: hasPaidCourse > 0,
      href: "/courses",
    },
    {
      id: "goal",
      done: allGoals.length > 0,
      href: "/dashboard/goals",
    },
  ];

  return {
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
    summary: {
      completedSessions,
      upcomingSessions,
      coursesEnrolled: enrolled.length,
      coursesInProgress,
      coursesCompleted,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      journalEntries: journalCount,
      moodStreak: computeMoodStreak(
        moodStreakRows.map((row) => row.checkInDate)
      ),
      favoritesCount,
    },
    nextBooking: nextBooking
      ? {
          id: nextBooking.id,
          serviceTitle: nextBooking.service.title,
          dateLabel: format(new Date(nextBooking.date), "EEEE d MMMM"),
          startTime: nextBooking.startTime,
          meetingUrl: nextBooking.meetingUrl,
        }
      : null,
    courses,
    goals,
    moodWeek,
    recentJournal,
    continuePodcasts,
    milestones,
  };
}
