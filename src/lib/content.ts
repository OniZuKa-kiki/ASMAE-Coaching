import { prisma } from "@/lib/db";

type CourseWithModules = {
  modules: {
    lessons: { videoUrl: string | null; pdfUrl: string | null }[];
  }[];
};

export type PublicCourse = {
  slug: string;
  title: string;
  description: string;
  price: number;
  modules: number;
  lessons: number;
  includes: string[];
};

function buildCourseIncludes(course: CourseWithModules): string[] {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const includes: string[] = [];
  if (lessons.some((lesson) => lesson.videoUrl)) includes.push("فيديوهات");
  if (lessons.some((lesson) => lesson.pdfUrl)) includes.push("PDF");
  if (includes.length === 0) includes.push("فيديوهات");
  includes.push("تمارين عملية");
  return includes;
}

function mapPublicCourse(
  course: {
    slug: string;
    title: string;
    description: string;
    price: number;
  } & CourseWithModules
): PublicCourse {
  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    price: course.price,
    modules: course.modules.length,
    lessons: lessonCount,
    includes: buildCourseIncludes(course),
  };
}

const publishedCourseInclude = {
  modules: {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        select: { videoUrl: true, pdfUrl: true },
      },
    },
  },
};

export async function getPublishedCourses(): Promise<PublicCourse[]> {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: publishedCourseInclude,
  });

  return courses.map(mapPublicCourse);
}

export async function getPublishedCourseBySlug(
  slug: string
): Promise<PublicCourse | null> {
  const course = await prisma.course.findFirst({
    where: { slug, isPublished: true },
    include: publishedCourseInclude,
  });

  if (!course) return null;
  return mapPublicCourse(course);
}

export async function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function getPublishedPodcasts() {
  return prisma.podcast.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPodcastBySlug(slug: string) {
  return prisma.podcast.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function getVisibleTestimonials() {
  return prisma.testimonial.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });
}

export function formatPodcastDuration(minutes: number | null | undefined): string {
  if (!minutes) return "—";
  return `${minutes} دقيقة`;
}

export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} دقيقة قراءة`;
}

export function renderBlogContent(content: string): string {
  return content
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      const withBold = trimmed.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );
      return `<p style="margin: 0 0 1.25rem 0; line-height: 1.8;">${withBold}</p>`;
    })
    .join("");
}
