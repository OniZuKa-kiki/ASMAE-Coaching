"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import type { AppLocale } from "@/i18n/routing";
import { matchesArabicSearch } from "@/lib/search-utils";
import { cn, formatDate } from "@/lib/utils";

export type GoalItem = {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  progress: number;
  isCompleted: boolean;
  updatedAt: string;
};

type GoalsListProps = {
  goals: GoalItem[];
};

export function GoalsList({ goals }: GoalsListProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.goals");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const query = search.trim();

  const filteredGoals = useMemo(() => {
    let items = goals.filter((goal) => {
      if (status === "active" && goal.isCompleted) return false;
      if (status === "completed" && !goal.isCompleted) return false;

      if (dateFilter === "with_target" && !goal.targetDate) return false;
      if (dateFilter === "without_target" && goal.targetDate) return false;

      if (!query) return true;
      const haystack = `${goal.title} ${goal.description ?? ""}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    const collator = locale === "fr" ? "fr" : "ar";
    switch (sort) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, collator));
      case "progress_desc":
        return sorted.sort((a, b) => b.progress - a.progress);
      case "progress_asc":
        return sorted.sort((a, b) => a.progress - b.progress);
      case "target_date":
        return sorted.sort((a, b) => {
          if (!a.targetDate && !b.targetDate) return 0;
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return (
            new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
          );
        });
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  }, [goals, status, dateFilter, query, sort, locale]);

  const resultsLabel =
    filteredGoals.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: filteredGoals.length });

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            id: "status",
            label: t("statusLabel"),
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: t("statusAll") },
              { value: "active", label: t("statusActive") },
              { value: "completed", label: t("statusCompleted") },
            ],
          },
          {
            id: "date",
            label: t("dateLabel"),
            value: dateFilter,
            onChange: setDateFilter,
            options: [
              { value: "all", label: t("dateAll") },
              { value: "with_target", label: t("dateWithTarget") },
              { value: "without_target", label: t("dateWithoutTarget") },
            ],
          },
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
              { value: "target_date", label: t("sortTargetDate") },
            ],
          },
        ]}
        resultsCount={filteredGoals.length}
        resultsLabel={resultsLabel}
      />

      <ListScrollHint
        count={filteredGoals.length}
        className="mb-3 text-end sm:text-start"
      />

      {filteredGoals.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{t("noResults")}</p>
        </Card>
      ) : (
        <ScrollableItemList
          count={filteredGoals.length}
          stackGapClassName="space-y-4"
          maxHeightClassName="max-h-96 sm:max-h-[28rem]"
        >
          {filteredGoals.map((goal) => (
            <Card key={goal.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "font-semibold text-heading",
                        goal.isCompleted && "text-text/60 line-through"
                      )}
                    >
                      {goal.title}
                    </p>
                    {goal.isCompleted ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        {t("completedBadge")}
                      </span>
                    ) : null}
                  </div>
                  {goal.description ? (
                    <p className="text-sm text-text/70 mt-1">{goal.description}</p>
                  ) : null}
                  <p className="text-xs text-text/60 mt-2">
                    {goal.targetDate
                      ? t("targetDate", {
                          date: formatDate(new Date(goal.targetDate), locale),
                        })
                      : t("noTargetDate")}
                  </p>
                </div>
                <div className="min-w-[180px] sm:max-w-[220px]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text/70">{t("progressLabel")}</span>
                    <span className="font-semibold text-primary">
                      {goal.progress}%
                    </span>
                  </div>
                  <ProgressBar value={goal.progress} />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/dashboard/goals/${goal.id}/edit`}
                  className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                >
                  {t("edit")}
                </Link>
              </div>
            </Card>
          ))}
        </ScrollableItemList>
      )}
    </>
  );
}
