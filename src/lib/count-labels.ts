import type { AppLocale } from "@/i18n/routing";
import {
  formatArabicLessonCount,
  formatArabicModuleCount,
} from "@/lib/arabic-count";

export type CountLabelKeys = {
  one: string;
  two: string;
  few: string;
  many: string;
};

export type CountLabelResolver = (
  variant: "one" | "two" | "few" | "many",
  count: number
) => string;

type TranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

export function createCountLabelResolver(
  translate: TranslateFn,
  keys: CountLabelKeys
): CountLabelResolver {
  return (variant, count) => {
    if (variant === "one") return translate(keys.one);
    if (variant === "two") return translate(keys.two);
    if (variant === "few") return translate(keys.few, { count });
    return translate(keys.many, { count });
  };
}

export function createCourseModuleCountResolver(
  translate: TranslateFn
): CountLabelResolver {
  return createCountLabelResolver(translate, {
    one: "moduleOne",
    two: "moduleTwo",
    few: "modulesFew",
    many: "modulesMany",
  });
}

export function createCourseLessonCountResolver(
  translate: TranslateFn
): CountLabelResolver {
  return createCountLabelResolver(translate, {
    one: "lessonOne",
    two: "lessonTwo",
    few: "lessonsFew",
    many: "lessonsMany",
  });
}

function formatCount(count: number, resolve: CountLabelResolver): string {
  if (count === 1) return resolve("one", count);
  if (count === 2) return resolve("two", count);
  if (count >= 3 && count <= 10) return resolve("few", count);
  return resolve("many", count);
}

export function formatModuleCount(
  count: number,
  locale: AppLocale,
  resolve: CountLabelResolver
): string {
  if (locale === "ar") return formatArabicModuleCount(count);
  return formatCount(count, resolve);
}

export function formatLessonCount(
  count: number,
  locale: AppLocale,
  resolve: CountLabelResolver
): string {
  if (locale === "ar") return formatArabicLessonCount(count);
  return formatCount(count, resolve);
}
