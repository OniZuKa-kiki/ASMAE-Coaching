"use client";



import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";



export { ListScrollHint } from "@/components/ui/list-scroll-hint";



export const SCROLL_LIST_THRESHOLD = 6;



type ScrollableListLayout = "stack" | "grid";



type ScrollableListOptions = {

  threshold?: number;

  layout?: ScrollableListLayout;

  maxHeightClassName?: string;

  stackGapClassName?: string;

};



export function scrollableListClassName(

  count: number,

  options?: ScrollableListOptions

) {

  const threshold = options?.threshold ?? SCROLL_LIST_THRESHOLD;

  const layout = options?.layout ?? "stack";

  const maxHeight = options?.maxHeightClassName ?? "max-h-64 sm:max-h-72";

  const stackGap = options?.stackGapClassName ?? "space-y-3";



  return cn(

    layout === "grid"

      ? "grid gap-2 sm:grid-cols-2 xl:grid-cols-3"

      : stackGap,

    count > threshold && `${maxHeight} overflow-y-auto pe-1`

  );

}



export function ListSectionHeader({

  title,

  count,

  threshold = SCROLL_LIST_THRESHOLD,

  hint,

  className,

}: {

  title: string;

  count: number;

  threshold?: number;

  hint?: string;

  className?: string;

}) {

  const t = useTranslations("common");

  const resolvedHint = hint ?? t("scrollListHint");



  return (

    <div

      className={cn(

        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",

        className

      )}

    >

      <h3 className="font-heading text-lg font-semibold text-heading">

        {title} ({count})

      </h3>

      {count > threshold ? (

        <p className="text-xs text-text/60">{resolvedHint}</p>

      ) : null}

    </div>

  );

}



export function CountSummaryChips({

  counts,

  minTypes = 2,

}: {

  counts: Record<string, number>;

  minTypes?: number;

}) {

  const entries = Object.entries(counts);

  if (entries.length < minTypes) return null;



  return (

    <div className="mb-4 flex flex-wrap gap-2">

      {entries.map(([label, count]) => (

        <span

          key={label}

          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"

        >

          {label}: {count}

        </span>

      ))}

    </div>

  );

}



export function ScrollableItemList({

  count,

  threshold = SCROLL_LIST_THRESHOLD,

  layout = "stack",

  className,

  maxHeightClassName,

  stackGapClassName,

  children,

}: {

  count: number;

  threshold?: number;

  layout?: ScrollableListLayout;

  className?: string;

  maxHeightClassName?: string;

  stackGapClassName?: string;

  children: React.ReactNode;

}) {

  return (

    <div

      className={cn(

        scrollableListClassName(count, {

          threshold,

          layout,

          maxHeightClassName,

          stackGapClassName,

        }),

        className

      )}

    >

      {children}

    </div>

  );

}

