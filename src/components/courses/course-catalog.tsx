"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, Video } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCourseIncludeLabel } from "@/lib/content-i18n";
import type { PublicCourse } from "@/lib/content";
import {
  createCourseLessonCountResolver,
  createCourseModuleCountResolver,
  formatLessonCount,
  formatModuleCount,
} from "@/lib/count-labels";
import { intlLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/utils";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { isFavorited } from "@/lib/favorites-utils";
import { matchesArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

type CourseCatalogProps = {
  courses: PublicCourse[];
  favoriteKeys?: string[];
  signedIn?: boolean;
};

export function CourseCatalog({
  courses,
  favoriteKeys = [],
  signedIn = false,
}: CourseCatalogProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("courses");
  const tFilters = useTranslations("courses.filters");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const query = search.trim();
  const priceLocale = intlLocale(locale);

  const resolveModuleCount = useMemo(
    () => createCourseModuleCountResolver(t),
    [t]
  );
  const resolveLessonCount = useMemo(
    () => createCourseLessonCountResolver(t),
    [t]
  );

  const filteredCourses = useMemo(() => {
    const items = courses.filter((course) => {
      if (!query) return true;
      const haystack = `${course.title} ${course.description}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    const collator = locale === "fr" ? "fr" : "ar";
    switch (sort) {
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "title":
        return sorted.sort((a, b) =>
          a.title.localeCompare(b.title, collator)
        );
      default:
        return sorted;
    }
  }, [courses, query, sort, locale]);

  const resultsLabel =
    filteredCourses.length === 1
      ? tFilters("resultsOne")
      : tFilters("resultsMany", { count: filteredCourses.length });

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFilters("searchPlaceholder")}
        searchLabel={tFilters("searchLabel")}
        filters={[
          {
            id: "sort",
            label: tFilters("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "default", label: tFilters("sortDefault") },
              { value: "price_asc", label: tFilters("sortPriceAsc") },
              { value: "price_desc", label: tFilters("sortPriceDesc") },
              { value: "title", label: tFilters("sortTitle") },
            ],
          },
        ]}
        resultsCount={filteredCourses.length}
        resultsLabel={resultsLabel}
      />

      {filteredCourses.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tFilters("noResults")}</p>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.slug} className="relative flex flex-col">
              <FavoriteButton
                entityType="COURSE"
                entityId={course.id}
                initialFavorited={isFavorited(favoriteKeys, "COURSE", course.id)}
                signedIn={signedIn}
                className="absolute top-3 left-3 z-10"
              />
              <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-primary/10">
                <Video className="h-12 w-12 text-primary/50" />
              </div>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="flex-1">
                {course.description}
              </CardDescription>
              <div className="my-4 flex flex-col gap-1 text-sm text-text/70">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {formatModuleCount(course.modules, locale, resolveModuleCount)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {formatLessonCount(course.lessons, locale, resolveLessonCount)}
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {course.includes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                  >
                    {formatCourseIncludeLabel(item, locale)}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                <span className="font-heading text-2xl font-semibold text-primary">
                  {formatPrice(course.price, "EUR", priceLocale)}
                </span>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  {t("viewProgram")}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
