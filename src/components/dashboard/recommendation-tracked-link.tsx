"use client";

import Link from "next/link";
import type {
  RecommendationSource,
  RecordRecommendationClickPayload,
} from "@/lib/recommendation-types";
import type { ContentRecommendationType } from "@/lib/recommendations";

type RecommendationTrackedLinkProps = {
  href: string;
  entityType: ContentRecommendationType;
  entityId: string;
  source: RecommendationSource;
  reasonKey: string;
  className?: string;
  children: React.ReactNode;
};

function trackRecommendationClick(payload: RecordRecommendationClickPayload) {
  const body = JSON.stringify({
    entityType: payload.entityType,
    entityId: payload.entityId,
    source: payload.source,
    reasonKey: payload.reasonKey,
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/recommendations/click",
      new Blob([body], { type: "application/json" })
    );
    return;
  }

  void fetch("/api/recommendations/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function RecommendationTrackedLink({
  href,
  entityType,
  entityId,
  source,
  reasonKey,
  className,
  children,
}: RecommendationTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackRecommendationClick({
          entityType: entityType === "course" ? "COURSE" : "PODCAST",
          entityId,
          source,
          reasonKey,
        })
      }
    >
      {children}
    </Link>
  );
}
