"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Headphones,
  PenLine,
  Target,
  Video,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ScrollableItemList } from "@/components/ui/scalable-list";
import { dateFnsLocaleFor } from "@/lib/locale";
import type { AppLocale } from "@/i18n/routing";
import type { UserJourneyData } from "@/lib/journey";
import { formatListenTime } from "@/lib/podcast-progress-utils";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type JourneyOverviewProps = {
  data: UserJourneyData;
};

export function JourneyOverview({ data }: JourneyOverviewProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.journey");
  const tCourses = useTranslations("dashboard.courses");
  const completedMilestones = data.milestones.filter((item) => item.done).length;

  const moodStreakLabel =
    data.summary.moodStreak === 0
      ? t("moodStreakZero")
      : data.summary.moodStreak === 1
        ? t("moodStreakOne")
        : t("moodStreakMany", { days: data.summary.moodStreak });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t("stats.sessions"),
            value: data.summary.completedSessions,
            icon: Calendar,
          },
          {
            label: t("stats.courses"),
            value: data.summary.coursesInProgress,
            icon: BookOpen,
          },
          {
            label: t("stats.goals"),
            value: data.summary.activeGoals,
            icon: Target,
          },
          {
            label: t("stats.journal"),
            value: data.summary.journalEntries,
            icon: PenLine,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-heading">{stat.value}</p>
                <p className="text-sm text-text/70">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardTitle className="mb-4 text-lg">{t("nextSessionTitle")}</CardTitle>
          {data.nextBooking ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-heading">
                  {data.nextBooking.serviceTitle}
                </p>
                <p className="text-sm text-text/70">
                  {data.nextBooking.dateLabel} · {data.nextBooking.startTime}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.nextBooking.meetingUrl ? (
                  <a
                    href={data.nextBooking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    <Video className="h-4 w-4" />
                    {t("joinSession")}
                  </a>
                ) : null}
                <ButtonLink href="/dashboard/bookings" variant="secondary">
                  {t("viewAll")}
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text/70">{t("noNextSession")}</p>
              <ButtonLink href="/booking">{t("bookSession")}</ButtonLink>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <CardTitle className="text-lg">{t("milestonesTitle")}</CardTitle>
            <span className="text-xs font-medium text-primary">
              {completedMilestones}/{data.milestones.length}
            </span>
          </div>
          <ul className="space-y-3">
            {data.milestones.map((milestone) => (
              <li key={milestone.id}>
                <Link
                  href={milestone.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    milestone.done
                      ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300"
                      : "border-border/70 hover:border-primary/30 hover:bg-primary/[0.03]"
                  )}
                >
                  {milestone.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-text/40" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      milestone.done ? "text-emerald-900" : "text-heading"
                    )}
                  >
                    {t(`milestones.${milestone.id}` as "milestones.intake")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{t("moodTitle")}</CardTitle>
          <span className="text-xs text-text/60">{moodStreakLabel}</span>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {data.moodWeek.map((day) => (
            <div
              key={day.dateKey}
              className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-card/80 px-0.5 py-2 sm:px-1 sm:py-3 text-center"
            >
              <span className="text-[10px] font-medium text-text/50 sm:text-xs">
                {day.dateLabel}
              </span>
              <span className="text-lg sm:text-2xl" aria-hidden>
                {day.emoji ?? t("moodEmpty")}
              </span>
              {day.label ? (
                <span className="hidden text-[10px] text-text/60 sm:block">
                  {day.label}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-heading">
              {t("coursesTitle")}
            </h2>
            <Link
              href="/dashboard/courses"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {data.courses.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="mb-4 text-sm text-text/70">{t("noCourses")}</p>
              <ButtonLink href="/courses" variant="secondary">
                {tCourses("discoverCourses")}
              </ButtonLink>
            </Card>
          ) : (
            <ScrollableItemList count={data.courses.length}>
              {data.courses.map((course) => (
                <Card key={course.id}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-heading line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-text/60">
                        {tCourses("lessonsCompleted", {
                          done: course.completedLessons,
                          total: course.totalLessons,
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {course.progress}%
                    </span>
                  </div>
                  <ProgressBar value={course.progress} className="mb-3" />
                  <Link
                    href={`/dashboard/resources?course=${course.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("continueCourse")}
                  </Link>
                </Card>
              ))}
            </ScrollableItemList>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-heading">
              {t("goalsTitle")}
            </h2>
            <Link
              href="/dashboard/goals"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {data.goals.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-sm text-text/70">{t("noGoals")}</p>
            </Card>
          ) : (
            <ScrollableItemList count={data.goals.length}>
              {data.goals.map((goal) => (
                <Card key={goal.id}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-heading">{goal.title}</h3>
                    <span className="text-sm font-semibold text-primary">
                      {goal.progress}%
                    </span>
                  </div>
                  {goal.targetDate ? (
                    <p className="mb-3 text-xs text-text/60">
                      {formatDate(goal.targetDate, locale)}
                    </p>
                  ) : null}
                  <ProgressBar value={goal.progress} />
                </Card>
              ))}
            </ScrollableItemList>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-heading">
              {t("journalTitle")}
            </h2>
            <Link
              href="/dashboard/journal"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {data.recentJournal.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="mb-4 text-sm text-text/70">{t("noJournal")}</p>
              <ButtonLink href="/dashboard/journal" variant="secondary">
                {t("openJournal")}
              </ButtonLink>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.recentJournal.map((entry) => (
                <Card key={entry.id}>
                  <div className="mb-2 flex items-center gap-2 text-xs text-text/60">
                    {entry.moodEmoji ? (
                      <span aria-hidden>{entry.moodEmoji}</span>
                    ) : null}
                    <span>
                      {format(new Date(entry.createdAt), "d MMMM yyyy", {
                        locale: dateFnsLocaleFor(locale),
                      })}
                    </span>
                    {entry.moodLabel ? <span>· {entry.moodLabel}</span> : null}
                  </div>
                  <p className="text-sm leading-relaxed text-text/80">
                    {entry.preview}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {data.continuePodcasts.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-heading">
                {t("podcastsTitle")}
              </h2>
              <Link
                href="/dashboard/podcasts"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
            <div className="space-y-3">
              {data.continuePodcasts.map((podcast) => {
                const percent =
                  podcast.durationSeconds > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (podcast.positionSeconds / podcast.durationSeconds) * 100
                        )
                      )
                    : 0;

                return (
                  <Card key={podcast.podcastId}>
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Headphones className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-heading line-clamp-1">
                          {podcast.title}
                        </h3>
                        <p className="text-xs text-text/60">
                          {formatListenTime(podcast.positionSeconds)} /{" "}
                          {formatListenTime(podcast.durationSeconds)}
                        </p>
                      </div>
                    </div>
                    <ProgressBar value={percent} className="mb-3" />
                    <Link
                      href={`/podcasts/${podcast.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {t("continueCourse")}
                    </Link>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
