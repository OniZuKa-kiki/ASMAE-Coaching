"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PanelPageSkeletonProps = {
  variant?: "stats" | "list";
  showFilters?: boolean;
  rows?: number;
};

export function PanelPageSkeleton({
  variant = "list",
  showFilters = true,
  rows = 4,
}: PanelPageSkeletonProps) {
  const t = useTranslations("common");

  return (
    <div className="duration-300" aria-busy aria-label={t("loadingAria")}>
      <Skeleton className="mb-6 h-9 w-48 sm:mb-8 sm:h-10" />

      {variant === "stats" ? (
        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-4 w-28" />
            </Card>
          ))}
        </div>
      ) : null}

      {showFilters ? (
        <Card className="mb-6">
          <Skeleton className="mb-4 h-7 w-40" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-11 md:col-span-1" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </Card>
      ) : null}

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3 max-w-xs" />
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
