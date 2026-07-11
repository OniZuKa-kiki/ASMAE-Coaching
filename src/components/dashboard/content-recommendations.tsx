import { BookOpen, Clock, Headphones, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { RecommendationSource } from "@/lib/recommendation-types";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { RecommendationTrackedLink } from "@/components/dashboard/recommendation-tracked-link";
import { formatPodcastDuration } from "@/lib/content-i18n";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getContentRecommendations,
  type ContentRecommendation,
  type ContentRecommendationType,
} from "@/lib/recommendations";
import { getOrCreateUser } from "@/lib/user";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ContentRecommendationsProps = {
  type?: ContentRecommendationType | "all";
  limit?: number;
  showCatalogLinks?: boolean;
  className?: string;
  source?: RecommendationSource;
};

function getReasonLabel(
  item: ContentRecommendation,
  t: Awaited<ReturnType<typeof getTranslations<"dashboard.recommendations">>>
) {
  if (item.topic) {
    const topicLabel = t(`topics.${item.topic}`);
    return t(`reasons.${item.reasonKey}`, { topic: topicLabel });
  }

  return t(`reasons.${item.reasonKey}`);
}

export async function ContentRecommendations({
  type = "all",
  limit = 4,
  showCatalogLinks = true,
  className,
  source = "DASHBOARD",
}: ContentRecommendationsProps) {
  const [user, locale, t] = await Promise.all([
    getOrCreateUser(),
    getRequestLocale(),
    getTranslations("dashboard.recommendations"),
  ]);

  if (!user) return null;

  const recommendations = await getContentRecommendations(user.id, { type, limit });
  if (recommendations.length === 0) return null;

  const appLocale = locale as AppLocale;
  const title =
    type === "course"
      ? t("titleCourses")
      : type === "podcast"
        ? t("titlePodcasts")
        : t("title");

  return (
    <section className={cn("mb-8", className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold text-heading">
              {title}
            </h2>
          </div>
          <p className="text-sm text-text/70">{t("subtitle")}</p>
        </div>
        {showCatalogLinks ? (
          <div className="flex flex-wrap gap-2">
            {type !== "podcast" ? (
              <ButtonLink href="/courses" variant="secondary" size="sm">
                {t("viewAllCourses")}
              </ButtonLink>
            ) : null}
            {type !== "course" ? (
              <ButtonLink href="/podcasts" variant="secondary" size="sm">
                {t("viewAllPodcasts")}
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "grid gap-4",
          recommendations.length > 1 ? "md:grid-cols-2" : "max-w-2xl"
        )}
      >
        {recommendations.map((item) => (
          <Card
            key={`${item.type}-${item.id}`}
            className="border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {item.type === "course" ? (
                  <BookOpen className="h-5 w-5 text-primary" />
                ) : (
                  <Headphones className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {item.description}
                </CardDescription>
                <p className="mt-2 text-xs font-medium text-primary">
                  {getReasonLabel(item, t)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <RecommendationTrackedLink
                    href={item.href}
                    entityType={item.type}
                    entityId={item.id}
                    source={source}
                    reasonKey={item.reasonKey}
                    className="text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {item.type === "course" ? t("viewCourse") : t("viewPodcast")}
                  </RecommendationTrackedLink>
                  {item.type === "podcast" && item.duration ? (
                    <span className="flex items-center gap-1 text-xs text-text/60">
                      <Clock className="h-3 w-3" />
                      {formatPodcastDuration(item.duration, appLocale)}
                    </span>
                  ) : null}
                  {item.isPremium ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t("premiumBadge")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
