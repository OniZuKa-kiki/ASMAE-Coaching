"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { dashboardContent } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

const content = dashboardContent.goals;

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

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function GoalsList({ goals }: GoalsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const query = normalizeSearch(search);

  const filteredGoals = useMemo(() => {
    let items = goals.filter((goal) => {
      if (status === "active" && goal.isCompleted) return false;
      if (status === "completed" && !goal.isCompleted) return false;

      if (dateFilter === "with_target" && !goal.targetDate) return false;
      if (dateFilter === "without_target" && goal.targetDate) return false;

      if (!query) return true;
      const haystack = `${goal.title} ${goal.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });

    const sorted = [...items];
    switch (sort) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
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
  }, [goals, status, dateFilter, query, sort]);

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={content.searchPlaceholder}
        filters={[
          {
            id: "status",
            label: content.statusLabel,
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: content.statusAll },
              { value: "active", label: content.statusActive },
              { value: "completed", label: content.statusCompleted },
            ],
          },
          {
            id: "date",
            label: content.dateLabel,
            value: dateFilter,
            onChange: setDateFilter,
            options: [
              { value: "all", label: content.dateAll },
              { value: "with_target", label: content.dateWithTarget },
              { value: "without_target", label: content.dateWithoutTarget },
            ],
          },
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
              { value: "target_date", label: content.sortTargetDate },
            ],
          },
        ]}
        resultsCount={filteredGoals.length}
        resultsLabel={content.resultsCount(filteredGoals.length)}
      />

      {filteredGoals.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{content.noResults}</p>
        </Card>
      ) : (
        <div className="space-y-4">
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
                        {content.completedBadge}
                      </span>
                    ) : null}
                  </div>
                  {goal.description ? (
                    <p className="text-sm text-text/70 mt-1">{goal.description}</p>
                  ) : null}
                  <p className="text-xs text-text/60 mt-2">
                    {goal.targetDate
                      ? content.targetDate(formatDate(new Date(goal.targetDate)))
                      : content.noTargetDate}
                  </p>
                </div>
                <div className="min-w-[180px] sm:max-w-[220px]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text/70">{content.progressLabel}</span>
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
                  {content.edit}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
