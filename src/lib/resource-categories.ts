export const lessonResourceCategories = [
  "VIDEO",
  "PDF",
  "AUDIO",
  "EXERCISE",
  "DOWNLOAD",
  "SHEET",
] as const;

export type LessonResourceCategory = (typeof lessonResourceCategories)[number];

export const resourceCategoryLabels: Record<LessonResourceCategory, string> = {
  VIDEO: "فيديوهات",
  PDF: "مستندات PDF",
  AUDIO: "صوتيات",
  EXERCISE: "تمارين",
  DOWNLOAD: "تنزيلات",
  SHEET: "بطاقات وجداول",
};

export const resourceCategoryFilterOptions = [
  { value: "all", label: "جميع الفئات" },
  ...lessonResourceCategories.map((category) => ({
    value: category,
    label: resourceCategoryLabels[category],
  })),
];

export function resolveLessonResourceCategory(input: {
  resourceCategory?: LessonResourceCategory | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  title?: string;
}): LessonResourceCategory {
  if (input.resourceCategory) return input.resourceCategory;

  const videoUrl = input.videoUrl?.toLowerCase() ?? "";
  if (videoUrl.includes(".mp3") || videoUrl.includes(".m4a") || videoUrl.includes(".wav")) {
    return "AUDIO";
  }
  if (input.pdfUrl) return "PDF";
  if (input.videoUrl) return "VIDEO";

  const title = input.title ?? "";
  if (title.includes("تمرين") || title.includes("ممارسة")) {
    return "EXERCISE";
  }

  return "VIDEO";
}

export function parseLessonResourceCategory(
  value: string
): LessonResourceCategory | null {
  return lessonResourceCategories.includes(value as LessonResourceCategory)
    ? (value as LessonResourceCategory)
    : null;
}
