"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  createCourseLessonCountResolver,
  createCourseModuleCountResolver,
  formatLessonCount,
  formatModuleCount,
} from "@/lib/count-labels";
import type { AppLocale } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { matchesArabicSearch } from "@/lib/search-utils";

export type DashboardCourseItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  moduleCount: number;
  lessonCount: number;
  enrolled: boolean;
  enrollmentId?: string;
  progressAuto?: number;
  completedLessons?: number;
  lastLessonTitle?: string | null;
  enrolledAt?: string;
};

type DashboardCourseCatalogProps = {
  courses: DashboardCourseItem[];
};

type ProgressFilter = "all" | "not_started" | "in_progress" | "completed";
type SectionFilter = "all" | "purchased" | "available";

function getProgressState(course: DashboardCourseItem): ProgressFilter {
  if (!course.enrolled) return "all";
  const progress = course.progressAuto ?? 0;
  if (progress >= 100) return "completed";
  if (progress > 0) return "in_progress";
  return "not_started";
}

function getProgressBadge(
  course: DashboardCourseItem,
  t: ReturnType<typeof useTranslations<"dashboard.courses">>
) {
  if (!course.enrolled) {
    return { label: t("badgeAvailable"), className: "bg-accent/15 text-accent" };
  }
  const state = getProgressState(course);
  if (state === "completed") {
    return { label: t("badgeCompleted"), className: "bg-primary/15 text-primary" };
  }
  if (state === "in_progress") {
    return { label: t("badgeInProgress"), className: "bg-accent/15 text-accent" };
  }
  return { label: t("badgeNotStarted"), className: "bg-border/60 text-text/70" };
}

export function DashboardCourseCatalog({ courses }: DashboardCourseCatalogProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.courses");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<SectionFilter>("all");
  const [progress, setProgress] = useState<ProgressFilter>("all");
  const [sort, setSort] = useState("recent");

  const query = search.trim();
  const collator = locale === "fr" ? "fr" : "ar";

  const stats = useMemo(() => {
    const purchased = courses.filter((course) => course.enrolled);
    const inProgress = purchased.filter(
      (course) => getProgressState(course) === "in_progress"
    );
    const completed = purchased.filter(
      (course) => getProgressState(course) === "completed"
    );
    const available = courses.filter((course) => !course.enrolled);

    return {
      purchased: purchased.length,
      inProgress: inProgress.length,
      completed: completed.length,
      available: available.length,
    };
  }, [courses]);

  const showProgressFilter = section === "all" || section === "purchased";

  const filteredCourses = useMemo(() => {
    let items = courses.filter((course) => {
      if (section === "purchased" && !course.enrolled) return false;
      if (section === "available" && course.enrolled) return false;

      if (showProgressFilter && progress !== "all" && course.enrolled) {
        if (getProgressState(course) !== progress) return false;
      }

      if (!query) return true;
      const haystack = `${course.title} ${course.description}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    switch (sort) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, collator));
      case "progress_desc":
        return sorted.sort(
          (a, b) => (b.progressAuto ?? -1) - (a.progressAuto ?? -1)
        );
      case "progress_asc":
        return sorted.sort(
          (a, b) => (a.progressAuto ?? 101) - (b.progressAuto ?? 101)
        );
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted.sort((a, b) => {
          if (a.enrolled && b.enrolled) {
            return (
              new Date(b.enrolledAt ?? 0).getTime() -
              new Date(a.enrolledAt ?? 0).getTime()
            );
          }
          if (a.enrolled !== b.enrolled) return a.enrolled ? -1 : 1;
          return a.title.localeCompare(b.title, collator);
        });
    }
  }, [courses, section, progress, query, sort, showProgressFilter, collator]);

  const purchasedVisible = filteredCourses.some((course) => course.enrolled);
  const availableVisible = filteredCourses.some((course) => !course.enrolled);
  const enrolledCourses = filteredCourses.filter((course) => course.enrolled);
  const availableCourses = filteredCourses.filter((course) => !course.enrolled);

  const resultsLabel =
    filteredCourses.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: filteredCourses.length });

  const filters = [
    {
      id: "section",
      label: t("sectionLabel"),
      value: section,
      onChange: (value: string) => setSection(value as SectionFilter),
      options: [
        { value: "all", label: t("sectionAll") },
        { value: "purchased", label: t("sectionPurchased") },
        { value: "available", label: t("sectionAvailable") },
      ],
    },
    ...(showProgressFilter
      ? [
          {
            id: "progress",
            label: t("progressLabel"),
            value: progress,
            onChange: (value: string) => setProgress(value as ProgressFilter),
            options: [
              { value: "all", label: t("progressAll") },
              { value: "not_started", label: t("progressNotStarted") },
              { value: "in_progress", label: t("progressInProgress") },
              { value: "completed", label: t("progressCompleted") },
            ],
          },
        ]
      : []),
    {
      id: "sort",
      label: t("sortLabel"),
      value: sort,
      onChange: setSort,
      options: [
        { value: "recent", label: t("sortRecent") },
        { value: "title", label: t("sortTitle") },
        { value: "progress_desc", label: t("sortProgressDesc") },
        { value: "progress_asc", label: t("sortProgressAsc") },
        { value: "price_asc", label: t("sortPriceAsc") },
        { value: "price_desc", label: t("sortPriceDesc") },
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <p className="text-sm text-text/70 max-w-2xl">{t("subtitle")}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={GraduationCap}
          label={t("stats.purchased")}
          value={stats.purchased}
        />
        <StatCard
          icon={BookOpen}
          label={t("stats.inProgress")}
          value={stats.inProgress}
        />
        <StatCard
          icon={CheckCircle2}
          label={t("stats.completed")}
          value={stats.completed}
        />
        <StatCard
          icon={ShoppingBag}
          label={t("stats.available")}
          value={stats.available}
        />
      </div>

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={filters}
        resultsCount={filteredCourses.length}
        resultsLabel={resultsLabel}
      />

      {filteredCourses.length === 0 ? (
        <Card className="py-12 text-center">
          {section === "purchased" && stats.purchased === 0 ? (
            <>
              <p className="text-text/70 mb-6">{t("noPurchases")}</p>
              <ButtonLink href="/courses">{t("discoverCourses")}</ButtonLink>
            </>
          ) : (
            <p className="text-text/70">{t("noResults")}</p>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {purchasedVisible ? (
            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-body font-semibold text-heading">
                  {t("sectionPurchased")}
                </h2>
                <ListScrollHint count={enrolledCourses.length} />
              </div>
              <ScrollableItemList
                count={enrolledCourses.length}
                layout="grid"
                className="gap-4 lg:grid-cols-2"
                maxHeightClassName="max-h-[32rem] sm:max-h-[36rem]"
              >
                {enrolledCourses.map((course) => (
                  <EnrolledCourseCard key={course.id} course={course} />
                ))}
              </ScrollableItemList>
            </section>
          ) : null}

          {availableVisible ? (
            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-body font-semibold text-heading">
                  {t("sectionAvailable")}
                </h2>
                <ListScrollHint count={availableCourses.length} />
              </div>
              <ScrollableItemList
                count={availableCourses.length}
                layout="grid"
                className="gap-4 md:grid-cols-2 xl:grid-cols-3"
                maxHeightClassName="max-h-[32rem] sm:max-h-[36rem]"
              >
                {availableCourses.map((course) => (
                  <AvailableCourseCard key={course.id} course={course} />
                ))}
              </ScrollableItemList>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-text/60 mb-1">{label}</p>
          <p className="font-heading text-2xl font-semibold text-heading">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}

function useCourseCountLabels() {
  const locale = useLocale() as AppLocale;
  const tCourses = useTranslations("courses");
  const resolveModuleCount = useMemo(
    () => createCourseModuleCountResolver(tCourses),
    [tCourses]
  );
  const resolveLessonCount = useMemo(
    () => createCourseLessonCountResolver(tCourses),
    [tCourses]
  );
  return { locale, resolveModuleCount, resolveLessonCount };
}

function EnrolledCourseCard({ course }: { course: DashboardCourseItem }) {
  const t = useTranslations("dashboard.courses");
  const { locale, resolveModuleCount, resolveLessonCount } = useCourseCountLabels();
  const badge = getProgressBadge(course, t);
  const progress = course.progressAuto ?? 0;

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            badge.className
          )}
        >
          {badge.label}
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {t("badgePurchased")}
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-heading mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-text/70 mb-4 line-clamp-2 flex-1">
        {course.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-text/60">
        <span>{formatModuleCount(course.moduleCount, locale, resolveModuleCount)}</span>
        <span>{formatLessonCount(course.lessonCount, locale, resolveLessonCount)}</span>
      </div>

      <div className="rounded-xl bg-background/80 p-4 mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text/70">{t("progressLabelShort")}</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <ProgressBar value={progress} className="mb-2" />
        <p className="text-xs text-text/70">
          {t("lessonsCompleted", {
            done: course.completedLessons ?? 0,
            total: course.lessonCount,
          })}
          {course.lastLessonTitle ? (
            <> · {t("lastLesson", { title: course.lastLessonTitle })}</>
          ) : (
            <> · {t("notStartedYet")}</>
          )}
        </p>
        <p className="text-xs text-text/50 mt-1">{t("progressNote")}</p>
      </div>

      <ButtonLink
        href={`/dashboard/resources?course=${course.id}`}
        size="sm"
        className="self-start"
      >
        {t("continue")}
      </ButtonLink>
    </Card>
  );
}

function AvailableCourseCard({ course }: { course: DashboardCourseItem }) {
  const t = useTranslations("dashboard.courses");
  const { locale, resolveModuleCount, resolveLessonCount } = useCourseCountLabels();

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3">
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
          {t("badgeAvailable")}
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-heading mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-text/70 mb-4 line-clamp-3 flex-1">
        {course.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-text/60">
        <span>{formatModuleCount(course.moduleCount, locale, resolveModuleCount)}</span>
        <span>{formatLessonCount(course.lessonCount, locale, resolveLessonCount)}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-4">
        <span className="font-heading text-xl font-semibold text-primary">
          {formatPrice(course.price)}
        </span>
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          {t("viewProgram")}
        </Link>
      </div>
    </Card>
  );
}
