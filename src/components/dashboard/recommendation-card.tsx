import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Compass,
  Headphones,
  Heart,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RecommendationTrackedLink } from "@/components/dashboard/recommendation-tracked-link";
import { formatPodcastDuration } from "@/lib/content-i18n";
import type { RecommendationSource } from "@/lib/recommendation-types";
import type {
  ContentRecommendation,
  RecommendationReasonKey,
} from "@/lib/recommendations";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type RecommendationCardProps = {
  item: ContentRecommendation;
  reasonLabel: string;
  topicLabel: string | null;
  ctaLabel: string;
  typeLabel: string;
  premiumBadge: string;
  locale: AppLocale;
  source: RecommendationSource;
  featured?: boolean;
};

type ReasonStyle = {
  icon: LucideIcon;
  accent: string;
  chip: string;
  iconWrap: string;
};

const REASON_STYLES: Record<RecommendationReasonKey, ReasonStyle> = {
  moodToday: {
    icon: Heart,
    accent: "border-s-accent bg-accent/8",
    chip: "bg-accent/12 text-accent",
    iconWrap: "bg-accent/15 text-accent",
  },
  moodRecent: {
    icon: Heart,
    accent: "border-s-accent bg-accent/8",
    chip: "bg-accent/12 text-accent",
    iconWrap: "bg-accent/15 text-accent",
  },
  goal: {
    icon: Target,
    accent: "border-s-primary bg-primary/6",
    chip: "bg-primary/10 text-primary",
    iconWrap: "bg-primary/12 text-primary",
  },
  intake: {
    icon: ClipboardList,
    accent: "border-s-primary bg-primary/6",
    chip: "bg-primary/10 text-primary",
    iconWrap: "bg-primary/12 text-primary",
  },
  service: {
    icon: Users,
    accent: "border-s-primary bg-primary/6",
    chip: "bg-primary/10 text-primary",
    iconWrap: "bg-primary/12 text-primary",
  },
  favorite: {
    icon: Star,
    accent: "border-s-accent bg-accent/6",
    chip: "bg-accent/10 text-accent",
    iconWrap: "bg-accent/12 text-accent",
  },
  journal: {
    icon: BookOpen,
    accent: "border-s-primary bg-primary/5",
    chip: "bg-primary/10 text-primary",
    iconWrap: "bg-primary/12 text-primary",
  },
  similar: {
    icon: TrendingUp,
    accent: "border-s-primary/70 bg-primary/5",
    chip: "bg-primary/8 text-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
  discover: {
    icon: Compass,
    accent: "border-s-border bg-card",
    chip: "bg-background text-text/70",
    iconWrap: "bg-background text-primary",
  },
};

export function RecommendationCard({
  item,
  reasonLabel,
  topicLabel,
  ctaLabel,
  typeLabel,
  premiumBadge,
  locale,
  source,
  featured = false,
}: RecommendationCardProps) {
  const style = REASON_STYLES[item.reasonKey];
  const ReasonIcon = style.icon;
  const TypeIcon = item.type === "course" ? BookOpen : Headphones;
  const ArrowIcon = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <RecommendationTrackedLink
      href={item.href}
      entityType={item.type}
      entityId={item.id}
      source={source}
      reasonKey={item.reasonKey}
      className={cn(
        "group relative block overflow-hidden rounded-card border border-border/60 shadow-soft transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]",
        "border-s-4",
        style.accent,
        featured ? "p-5 sm:p-6" : "p-4 sm:p-5"
      )}
    >
      <div
        className={cn(
          "flex gap-4",
          featured ? "flex-col sm:flex-row sm:items-center" : "flex-col"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl",
            style.iconWrap,
            featured ? "h-14 w-14" : "h-11 w-11"
          )}
        >
          <TypeIcon className={featured ? "h-6 w-6" : "h-5 w-5"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                style.chip
              )}
            >
              <ReasonIcon className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{reasonLabel}</span>
            </span>
            <span className="rounded-full border border-border/70 bg-card/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-text/55">
              {typeLabel}
            </span>
            {item.isPremium ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                {premiumBadge}
              </span>
            ) : null}
          </div>

          <h3
            className={cn(
              "font-heading font-semibold text-heading transition-colors group-hover:text-primary",
              featured ? "text-xl sm:text-2xl" : "text-lg"
            )}
          >
            {item.title}
          </h3>

          <p
            className={cn(
              "mt-1.5 text-text/75 leading-relaxed",
              featured ? "line-clamp-3 text-sm sm:text-base" : "line-clamp-2 text-sm"
            )}
          >
            {item.description}
          </p>

          {topicLabel ? (
            <p className="mt-2 text-xs font-medium text-text/55">
              {topicLabel}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-3",
            featured ? "sm:flex-col sm:items-end" : "justify-between"
          )}
        >
          {item.type === "podcast" && item.duration ? (
            <span className="text-xs font-medium text-text/55">
              {formatPodcastDuration(item.duration, locale)}
            </span>
          ) : null}

          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white",
              "transition-colors group-hover:bg-primary-hover"
            )}
          >
            {item.type === "podcast" ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : null}
            {ctaLabel}
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </RecommendationTrackedLink>
  );
}
