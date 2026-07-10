"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, Video } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { coursesPageContent } from "@/lib/constants";
import {
  formatCourseIncludeLabel,
  type PublicCourse,
} from "@/lib/content";
import {
  formatArabicLessonCount,
  formatArabicModuleCount,
} from "@/lib/arabic-count";
import { formatPrice } from "@/lib/utils";
import { ContentFilterBar } from "@/components/content/content-filter-bar";

type CourseCatalogProps = {
  courses: PublicCourse[];
};

const filters = coursesPageContent.filters;

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function CourseCatalog({ courses }: CourseCatalogProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const query = normalizeSearch(search);

  const filteredCourses = useMemo(() => {
    let items = courses.filter((course) => {
      if (!query) return true;
      const haystack = `${course.title} ${course.description}`.toLowerCase();
      return haystack.includes(query);
    });

    const sorted = [...items];
    switch (sort) {
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
      default:
        return sorted;
    }
  }, [courses, query, sort]);

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={filters.searchPlaceholder}
        searchLabel={filters.searchLabel}
        filters={[
          {
            id: "sort",
            label: filters.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "default", label: filters.sortDefault },
              { value: "price_asc", label: filters.sortPriceAsc },
              { value: "price_desc", label: filters.sortPriceDesc },
              { value: "title", label: filters.sortTitle },
            ],
          },
        ]}
        resultsCount={filteredCourses.length}
        resultsLabel={filters.resultsCount(filteredCourses.length)}
      />

      {filteredCourses.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{filters.noResults}</p>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.slug} className="flex flex-col">
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
                  {formatArabicModuleCount(course.modules)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {formatArabicLessonCount(course.lessons)}
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {course.includes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                  >
                    {formatCourseIncludeLabel(item)}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                <span className="font-heading text-2xl font-semibold text-primary">
                  {formatPrice(course.price)}
                </span>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  {coursesPageContent.viewProgramLabel}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
