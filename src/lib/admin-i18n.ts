import type { AppLocale } from "@/i18n/routing";
import { lessonResourceCategories } from "@/lib/resource-categories";
import { RECOMMENDATION_TOPICS } from "@/lib/recommendation-topics";
import adminPagesAr from "../../messages/admin-pages-ar.json";
import adminPagesFr from "../../messages/admin-pages-fr.json";

export type AdminPagesCopy = typeof adminPagesAr;

export function getAdminPagesCopy(locale: AppLocale): AdminPagesCopy {
  return locale === "fr" ? adminPagesFr : adminPagesAr;
}

export function getAdminFilters(locale: AppLocale) {
  return getAdminPagesCopy(locale).filters;
}

export function getAdminBookingStatuses(locale: AppLocale) {
  return getAdminPagesCopy(locale).statuses.booking;
}

export function getAdminPaymentStatuses(locale: AppLocale) {
  return getAdminPagesCopy(locale).statuses.payment;
}

export function getAdminRoles(locale: AppLocale) {
  return getAdminPagesCopy(locale).roles;
}

export function getAdminErrors(locale: AppLocale) {
  return getAdminPagesCopy(locale).errors;
}

export function getAdminResourceCategoryOptions(locale: AppLocale) {
  const labels = getAdminPagesCopy(locale).resourceCategories;
  return [
    { value: "all", label: labels.all },
    ...lessonResourceCategories.map((category) => ({
      value: category,
      label: labels[category],
    })),
  ];
}

export function getAdminDayOptions(locale: AppLocale) {
  const days = getAdminPagesCopy(locale).settings.availability.days;
  return Object.entries(days).map(([value, label]) => ({ value, label }));
}

export function getAdminDayLabel(locale: AppLocale, dayOfWeek: number): string {
  const days = getAdminPagesCopy(locale).settings.availability.days;
  return days[String(dayOfWeek) as keyof typeof days] ??
    getAdminPagesCopy(locale).settings.availability.dayFallback.replace(
      "{day}",
      String(dayOfWeek)
    );
}

export function getAdminRecommendationTopicOptions(locale: AppLocale) {
  const labels = getAdminPagesCopy(locale).recommendationTopics.options;
  return RECOMMENDATION_TOPICS.map((id) => ({
    id,
    label: labels[id as keyof typeof labels] ?? id,
  }));
}

export function formatAdminUserRole(role: string, locale: AppLocale): string {
  const roles = getAdminRoles(locale);
  return roles[role as keyof typeof roles] ?? role;
}
