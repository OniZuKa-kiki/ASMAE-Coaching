import arMessages from "../../messages/ar.json";
import frMessages from "../../messages/fr.json";
import type { AppLocale } from "@/i18n/routing";
import type { CourseIncludeKey } from "@/lib/content";

type BlogReadTimeCopy = Pick<
  typeof arMessages.blog,
  "readTimeOne" | "readTimeTwo" | "readTimeFew" | "readTimeMany"
>;

function blogReadTimeCopy(locale: AppLocale): BlogReadTimeCopy {
  return locale === "fr" ? frMessages.blog : arMessages.blog;
}

function courseIncludesCopy(locale: AppLocale) {
  return locale === "fr" ? frMessages.courses.includes : arMessages.courses.includes;
}

export function formatCourseIncludeLabel(
  key: CourseIncludeKey,
  locale: AppLocale
): string {
  return courseIncludesCopy(locale)[key];
}

export function formatPodcastDuration(
  minutes: number | null | undefined,
  locale: AppLocale
): string {
  if (!minutes) return "—";
  const template =
    locale === "fr"
      ? frMessages.podcasts.durationMinutes
      : arMessages.podcasts.durationMinutes;
  return template.replace("{count}", String(minutes));
}

export function estimateReadTime(content: string, locale: AppLocale): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const copy = blogReadTimeCopy(locale);

  if (minutes === 1) return copy.readTimeOne;
  if (minutes === 2) return copy.readTimeTwo;
  if (minutes >= 3 && minutes <= 10) {
    return copy.readTimeFew.replace("{count}", String(minutes));
  }
  return copy.readTimeMany.replace("{count}", String(minutes));
}
