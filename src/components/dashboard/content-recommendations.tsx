import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { ButtonLink } from "@/components/ui/button";
import type { RecommendationSource } from "@/lib/recommendation-types";
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

  const typeLabel =
    type === "course"
      ? t("typeCourse")
      : type === "podcast"
        ? t("typePodcast")
        : null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-card border border-primary/12 bg-gradient-to-br from-primary/[0.06] via-card to-accent/[0.04] p-5 sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("personalizedBadge")}
            </span>
          </div>
          <h2 className="font-heading text-xl font-semibold text-heading sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-text/70">
            {t("subtitle")}
          </p>
        </div>

        {showCatalogLinks ? (
          <div className="flex shrink-0 flex-wrap gap-2">
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
          "grid gap-3",
          recommendations.length === 1
            ? "grid-cols-1"
            : recommendations.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 xl:grid-cols-2"
        )}
      >
        {recommendations.map((item) => (
          <RecommendationCard
            key={`${item.type}-${item.id}`}
            item={item}
            reasonLabel={getReasonLabel(item, t)}
            topicLabel={
              item.topic && item.reasonKey !== "moodToday"
                ? t(`topics.${item.topic}`)
                : null
            }
            ctaLabel={
              item.type === "course" ? t("viewCourse") : t("viewPodcast")
            }
            typeLabel={
              typeLabel ??
              (item.type === "course" ? t("typeCourse") : t("typePodcast"))
            }
            premiumBadge={t("premiumBadge")}
            locale={appLocale}
            source={source}
            featured={recommendations.length === 1}
          />
        ))}
      </div>
    </section>
  );
}
