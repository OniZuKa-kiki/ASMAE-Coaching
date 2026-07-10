"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  FileText,
  Headphones,
  PlayCircle,
  Video,
} from "lucide-react";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { libraryPageContent } from "@/lib/constants";
import { toggleLessonCompletion } from "@/lib/lesson-completion-actions";
import {
  lessonResourceCategories,
  resourceCategoryLabels,
  type LessonResourceCategory,
} from "@/lib/resource-categories";
import { cn } from "@/lib/utils";

export type LibraryResourceItem = {
  id: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  category: LessonResourceCategory;
  completed: boolean;
};

type LibraryCatalogProps = {
  resources: LibraryResourceItem[];
  selectedCourseId?: string;
  selectedCourseTitle?: string | null;
};

const categoryIcons: Record<LessonResourceCategory, typeof Video> = {
  VIDEO: Video,
  PDF: FileText,
  AUDIO: Headphones,
  EXERCISE: BookOpen,
  DOWNLOAD: Download,
  SHEET: FileText,
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function LibraryCatalog({
  resources,
  selectedCourseId,
  selectedCourseTitle,
}: LibraryCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("course");

  const query = normalizeSearch(search);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      lessonResourceCategories.map((key) => [key, 0])
    ) as Record<LessonResourceCategory, number>;

    for (const resource of resources) {
      counts[resource.category] += 1;
    }

    return counts;
  }, [resources]);

  const filteredResources = useMemo(() => {
    let items = resources.filter((resource) => {
      if (category !== "all" && resource.category !== category) return false;
      if (status === "completed" && !resource.completed) return false;
      if (status === "pending" && resource.completed) return false;
      if (!query) return true;
      const haystack =
        `${resource.lessonTitle} ${resource.moduleTitle} ${resource.courseTitle}`.toLowerCase();
      return haystack.includes(query);
    });

    items = [...items];
    switch (sort) {
      case "title":
        return items.sort((a, b) =>
          a.lessonTitle.localeCompare(b.lessonTitle, "ar")
        );
      case "category":
        return items.sort((a, b) =>
          resourceCategoryLabels[a.category].localeCompare(
            resourceCategoryLabels[b.category],
            "ar"
          )
        );
      default:
        return items.sort((a, b) => {
          const courseCompare = a.courseTitle.localeCompare(b.courseTitle, "ar");
          if (courseCompare !== 0) return courseCompare;
          return a.lessonTitle.localeCompare(b.lessonTitle, "ar");
        });
    }
  }, [resources, category, status, query, sort]);

  const grouped = useMemo(() => {
    return filteredResources.reduce(
      (acc, resource) => {
        acc[resource.courseId] ??= {
          courseId: resource.courseId,
          courseTitle: resource.courseTitle,
          modules: {},
        };
        acc[resource.courseId].modules[resource.moduleTitle] ??= [];
        acc[resource.courseId].modules[resource.moduleTitle].push(resource);
        return acc;
      },
      {} as Record<
        string,
        {
          courseId: string;
          courseTitle: string;
          modules: Record<string, LibraryResourceItem[]>;
        }
      >
    );
  }, [filteredResources]);

  const completedCount = filteredResources.filter((item) => item.completed).length;

  return (
    <div>
      {selectedCourseId ? (
        <Card className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-text/60">
                {libraryPageContent.selectedCourseLabel}
              </p>
              <p className="font-semibold text-heading">
                {selectedCourseTitle ?? libraryPageContent.selectedCourseFallback}
              </p>
              <p className="mt-1 text-sm text-text/70">
                {filteredResources.length === 0
                  ? libraryPageContent.noCourseContent
                  : libraryPageContent.completedCount(
                      completedCount,
                      filteredResources.length
                    )}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/courses"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
              >
                {libraryPageContent.coursesLink}
              </Link>
              <Link
                href="/dashboard/resources"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                {libraryPageContent.viewAllLink}
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <p className="mb-6 text-text/70">{libraryPageContent.subtitle}</p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {lessonResourceCategories.map((key) => {
          const Icon = categoryIcons[key];
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(active ? "all" : key)}
              className={cn(
                "rounded-2xl border p-3 text-start transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-card hover:border-primary/40"
              )}
            >
              <Icon
                className={cn(
                  "mb-2 h-4 w-4",
                  active ? "text-primary" : "text-text/60"
                )}
              />
              <p className="text-xs font-semibold text-heading">
                {resourceCategoryLabels[key]}
              </p>
              <p className="mt-1 text-lg font-semibold text-heading tabular-nums">
                {categoryCounts[key]}
              </p>
            </button>
          );
        })}
      </div>

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={libraryPageContent.searchPlaceholder}
        filters={[
          {
            id: "category",
            label: libraryPageContent.categoryLabel,
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: libraryPageContent.allCategories },
              ...lessonResourceCategories.map((key) => ({
                value: key,
                label: resourceCategoryLabels[key],
              })),
            ],
          },
          {
            id: "status",
            label: libraryPageContent.statusLabel,
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: libraryPageContent.allStatuses },
              { value: "completed", label: libraryPageContent.completedStatus },
              { value: "pending", label: libraryPageContent.pendingStatus },
            ],
          },
          {
            id: "sort",
            label: libraryPageContent.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "course", label: libraryPageContent.sortCourse },
              { value: "title", label: libraryPageContent.sortTitle },
              { value: "category", label: libraryPageContent.sortCategory },
            ],
          },
        ]}
        resultsCount={filteredResources.length}
        resultsLabel={
          filteredResources.length === 1
            ? libraryPageContent.oneResult
            : libraryPageContent.resultsCount(filteredResources.length)
        }
      />

      {filteredResources.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{libraryPageContent.noResults}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map((course) => (
            <div key={course.courseId} className="space-y-3">
              {!selectedCourseId ? (
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold text-heading">
                    {course.courseTitle}
                  </h2>
                  <Link
                    href={`/dashboard/resources?course=${course.courseId}`}
                    className="text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {libraryPageContent.openCourse}
                  </Link>
                </div>
              ) : null}

              {Object.entries(course.modules).map(([moduleTitle, lessons]) => (
                <Card key={`${course.courseId}-${moduleTitle}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-text/60">
                        {libraryPageContent.moduleLabel}
                      </p>
                      <p className="font-semibold text-heading">{moduleTitle}</p>
                    </div>
                    <p className="text-xs text-text/60">
                      {lessons.filter((lesson) => lesson.completed).length}/
                      {lessons.length} {libraryPageContent.completedShort}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {lessons.map((resource) => {
                      const CategoryIcon = categoryIcons[resource.category];
                      return (
                        <div
                          key={resource.id}
                          className="rounded-xl border border-border/60 bg-background/40 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                  <CategoryIcon className="h-3.5 w-3.5" />
                                  {resourceCategoryLabels[resource.category]}
                                </span>
                                {resource.completed ? (
                                  <span className="text-xs font-semibold text-primary">
                                    {libraryPageContent.lessonCompleted}
                                  </span>
                                ) : null}
                              </div>
                              <p className="font-semibold text-heading">
                                {resource.lessonTitle}
                              </p>
                            </div>
                            <ActionForm action={toggleLessonCompletion}>
                              <input
                                type="hidden"
                                name="lessonId"
                                value={resource.id}
                              />
                              <input
                                type="hidden"
                                name="action"
                                value={resource.completed ? "undo" : "complete"}
                              />
                              <button
                                type="submit"
                                className={
                                  resource.completed
                                    ? "rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                                    : "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                                }
                              >
                                {resource.completed
                                  ? libraryPageContent.markIncomplete
                                  : libraryPageContent.markComplete}
                              </button>
                            </ActionForm>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {resource.videoUrl &&
                            resource.category !== "AUDIO" ? (
                              <a
                                href={resource.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                              >
                                <PlayCircle className="h-4 w-4" />
                                {libraryPageContent.watchVideo}
                              </a>
                            ) : null}
                            {resource.videoUrl && resource.category === "AUDIO" ? (
                              <a
                                href={resource.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                              >
                                <Headphones className="h-4 w-4" />
                                {libraryPageContent.listenAudio}
                              </a>
                            ) : null}
                            {resource.pdfUrl ? (
                              <a
                                href={resource.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                              >
                                <FileText className="h-4 w-4" />
                                {resource.category === "SHEET"
                                  ? libraryPageContent.openSheet
                                  : libraryPageContent.openPdf}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
