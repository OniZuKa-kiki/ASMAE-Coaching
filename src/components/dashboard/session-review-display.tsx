"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SessionReviewSnapshot } from "@/lib/session-review";

type SessionReviewDisplayProps = {
  review: SessionReviewSnapshot;
};

export function SessionReviewDisplay({ review }: SessionReviewDisplayProps) {
  const t = useTranslations("dashboard.sessionReview");

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-xs font-semibold text-heading">{t("submittedLabel")}</p>
      <div className="mt-1 flex items-center gap-0.5">
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star
            key={index}
            className="h-3.5 w-3.5 fill-accent text-accent"
          />
        ))}
      </div>
      {review.comment ? (
        <p className="mt-2 text-sm text-text/80">{review.comment}</p>
      ) : null}
    </div>
  );
}
