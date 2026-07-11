"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SCROLL_LIST_THRESHOLD } from "@/components/ui/scalable-list";

export function ListScrollHint({
  count,
  threshold = SCROLL_LIST_THRESHOLD,
  className,
}: {
  count: number;
  threshold?: number;
  className?: string;
}) {
  const t = useTranslations("common");

  if (count <= threshold) return null;

  return (
    <p className={cn("text-xs text-text/60", className)}>{t("scrollListHint")}</p>
  );
}
