"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap, ShoppingBag } from "lucide-react";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  formatArabicLessonCount,
  formatArabicModuleCount,
} from "@/lib/arabic-count";
import { dashboardContent } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const content = dashboardContent.courses;

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

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getProgressState(course: DashboardCourseItem): ProgressFilter {
  if (!course.enrolled) return "all";
  const progress = course.progressAuto ?? 0;
  if (progress >= 100) return "completed";
  if (progress > 0) return "in_progress";
  return "not_started";
}

function getProgressBadge(course: DashboardCourseItem) {
  if (!course.enrolled) {
    return { label: content.badgeAvailable, className: "bg-accent/15 text-accent" };
  }
  const state = getProgressState(course);
  if (state === "completed") {
    return { label: content.badgeCompleted, className: "bg-primary/15 text-primary" };
  }
  if (state === "in_progress") {
    return { label: content.badgeInProgress, className: "bg-accent/15 text-accent" };
  }
  return { label: content.badgeNotStarted, className: "bg-border/60 text-text/70" };
}

export function DashboardCourseCatalog({ courses }: DashboardCourseCatalogProps) {
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<SectionFilter>("all");
  const [progress, setProgress] = useState<ProgressFilter>("all");
  const [sort, setSort] = useState("recent");

  const query = normalizeSearch(search);

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
      const haystack = `${course.title} ${course.description}`.toLowerCase();
      return haystack.includes(query);
    });

    const sorted = [...items];
    switch (sort) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
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
          return a.title.localeCompare(b.title, "ar");
        });
    }
  }, [courses, section, progress, query, sort, showProgressFilter]);

  const purchasedVisible = filteredCourses.some((course) => course.enrolled);
  const availableVisible = filteredCourses.some((course) => !course.enrolled);

  const filters = [
    {
      id: "section",
      label: content.sectionLabel,
      value: section,
      onChange: (value: string) => setSection(value as SectionFilter),
      options: [
        { value: "all", label: content.sectionAll },
        { value: "purchased", label: content.sectionPurchased },
        { value: "available", label: content.sectionAvailable },
      ],
    },
    ...(showProgressFilter
      ? [
          {
            id: "progress",
            label: content.progressLabel,
            value: progress,
            onChange: (value: string) => setProgress(value as ProgressFilter),
            options: [
              { value: "all", label: content.progressAll },
              { value: "not_started", label: content.progressNotStarted },
              { value: "in_progress", label: content.progressInProgress },
              { value: "completed", label: content.progressCompleted },
            ],
          },
        ]
      : []),
    {
      id: "sort",
      label: content.sortLabel,
      value: sort,
      onChange: setSort,
      options: [
        { value: "recent", label: content.sortRecent },
        { value: "title", label: content.sortTitle },
        { value: "progress_desc", label: content.sortProgressDesc },
        { value: "progress_asc", label: content.sortProgressAsc },
        { value: "price_asc", label: content.sortPriceAsc },
        { value: "price_desc", label: content.sortPriceDesc },
      ],
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <p className="text-sm text-text/70 max-w-2xl">{content.subtitle}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={GraduationCap}
          label={content.stats.purchased}
          value={stats.purchased}
        />
        <StatCard
          icon={BookOpen}
          label={content.stats.inProgress}
          value={stats.inProgress}
        />
        <StatCard
          icon={CheckCircle2}
          label={content.stats.completed}
          value={stats.completed}
        />
        <StatCard
          icon={ShoppingBag}
          label={content.stats.available}
          value={stats.available}
        />
      </div>

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={content.searchPlaceholder}
        filters={filters}
        resultsCount={filteredCourses.length}
        resultsLabel={content.resultsCount(filteredCourses.length)}
      />

      {filteredCourses.length === 0 ? (
        <Card className="py-12 text-center">
          {section === "purchased" && stats.purchased === 0 ? (
            <>
              <p className="text-text/70 mb-6">{content.noPurchases}</p>
              <ButtonLink href="/courses">{content.discoverCourses}</ButtonLink>
            </>
          ) : (
            <p className="text-text/70">{content.noResults}</p>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {purchasedVisible ? (
            <section>
              <h2 className="font-body font-semibold text-heading mb-4">
                {content.sectionPurchased}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredCourses
                  .filter((course) => course.enrolled)
                  .map((course) => (
                    <EnrolledCourseCard key={course.id} course={course} />
                  ))}
              </div>
            </section>
          ) : null}

          {availableVisible ? (
            <section>
              <h2 className="font-body font-semibold text-heading mb-4">
                {content.sectionAvailable}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCourses
                  .filter((course) => !course.enrolled)
                  .map((course) => (
                    <AvailableCourseCard key={course.id} course={course} />
                  ))}
              </div>
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

function EnrolledCourseCard({ course }: { course: DashboardCourseItem }) {
  const badge = getProgressBadge(course);
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
          {content.badgePurchased}
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-heading mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-text/70 mb-4 line-clamp-2 flex-1">
        {course.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-text/60">
        <span>{formatArabicModuleCount(course.moduleCount)}</span>
        <span>{formatArabicLessonCount(course.lessonCount)}</span>
      </div>

      <div className="rounded-xl bg-background/80 p-4 mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text/70">{content.progressLabelShort}</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <ProgressBar value={progress} className="mb-2" />
        <p className="text-xs text-text/70">
          {content.lessonsCompleted(
            course.completedLessons ?? 0,
            course.lessonCount
          )}
          {course.lastLessonTitle ? (
            <> · {content.lastLesson(course.lastLessonTitle)}</>
          ) : (
            <> · {content.notStartedYet}</>
          )}
        </p>
        <p className="text-xs text-text/50 mt-1">{content.progressNote}</p>
      </div>

      <ButtonLink
        href={`/dashboard/resources?course=${course.id}`}
        size="sm"
        className="self-start"
      >
        {content.continue}
      </ButtonLink>
    </Card>
  );
}

function AvailableCourseCard({ course }: { course: DashboardCourseItem }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3">
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
          {content.badgeAvailable}
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-heading mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-text/70 mb-4 line-clamp-3 flex-1">
        {course.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-text/60">
        <span>{formatArabicModuleCount(course.moduleCount)}</span>
        <span>{formatArabicLessonCount(course.lessonCount)}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/50 pt-4">
        <span className="font-heading text-xl font-semibold text-primary">
          {formatPrice(course.price)}
        </span>
        <Link
          href={`/courses/${course.slug}`}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          {content.viewProgram}
        </Link>
      </div>
    </Card>
  );
}
