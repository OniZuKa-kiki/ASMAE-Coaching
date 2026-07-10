export function formatArabicModuleCount(count: number): string {
  if (count === 1) return "وحدة واحدة";
  if (count === 2) return "وحدتان";
  if (count >= 3 && count <= 10) return `${count} وحدات`;
  return `${count} وحدة`;
}

export function formatArabicLessonCount(count: number): string {
  if (count === 1) return "درس واحد";
  if (count === 2) return "درسان";
  if (count >= 3 && count <= 10) return `${count} دروس`;
  return `${count} درس`;
}
