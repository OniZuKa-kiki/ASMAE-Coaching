"use client";

import { Headphones, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type PodcastThumbnailProps = {
  isPremium: boolean;
  badgeLabel?: string;
  size?: "sm" | "md";
};

export function PodcastThumbnail({
  isPremium,
  badgeLabel,
  size = "md",
}: PodcastThumbnailProps) {
  const t = useTranslations("podcasts");
  const resolvedBadgeLabel = badgeLabel ?? t("premiumBadge");
  const iconSize = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const headphonesSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className="relative shrink-0 self-start pt-2">
      {isPremium ? (
        <span className="absolute -top-0.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full border border-accent/25 bg-card px-1.5 py-0.5 text-[10px] font-semibold text-accent shadow-sm">
          <Lock className="h-2.5 w-2.5 shrink-0" />
          {resolvedBadgeLabel}
        </span>
      ) : null}
      <div
        className={cn(
          iconSize,
          "flex items-center justify-center rounded-full",
          isPremium ? "bg-accent/10" : "bg-primary/10"
        )}
      >
        <Headphones
          className={cn(
            headphonesSize,
            isPremium ? "text-accent" : "text-primary"
          )}
        />
      </div>
    </div>
  );
}
