import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import {
  PUBLIC_CACHE_TAGS,
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
} from "@/lib/public-cache";

type CourseWithModules = {
  modules: {
    lessons: { videoUrl: string | null; pdfUrl: string | null }[];
  }[];
};

export type CourseIncludeKey = "videos" | "downloads" | "exercises";

export type PublicCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  modules: number;
  lessons: number;
  includes: CourseIncludeKey[];
};

function buildCourseIncludes(course: CourseWithModules): CourseIncludeKey[] {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const includes: CourseIncludeKey[] = [];
  if (lessons.some((lesson) => lesson.videoUrl)) {
    includes.push("videos");
  }
  if (lessons.some((lesson) => lesson.pdfUrl)) {
    includes.push("downloads");
  }
  if (includes.length === 0) includes.push("videos");
  includes.push("exercises");
  return includes;
}

const COURSE_DISPLAY_ORDER = [
  "objectifs-vie",
  "gestion-stress",
  "confiance-en-soi",
] as const;

function sortCourses<T extends { slug: string }>(courses: T[]): T[] {
  return [...courses].sort((a, b) => {
    const ai = COURSE_DISPLAY_ORDER.indexOf(
      a.slug as (typeof COURSE_DISPLAY_ORDER)[number]
    );
    const bi = COURSE_DISPLAY_ORDER.indexOf(
      b.slug as (typeof COURSE_DISPLAY_ORDER)[number]
    );
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

function mapPublicCourse(
  course: {
    id: string;
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
    id: course.id,
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
  return getPublishedCoursesCached();
}

const getPublishedCoursesCached = unstable_cache(
  async (): Promise<PublicCourse[]> => {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: publishedCourseInclude,
    });

    return sortCourses(courses.map(mapPublicCourse));
  },
  ["published-courses"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.courses],
  }
);

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
  return getPublishedBlogPostsCached();
}

const getPublishedBlogPostsCached = unstable_cache(
  async () =>
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
  ["published-blog-posts"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.blog],
  }
);

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function getPublishedPodcasts() {
  return getPublishedPodcastsCached();
}

const getPublishedPodcastsCached = unstable_cache(
  async () => {
    const podcasts = await prisma.podcast.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    const order = [
      "meditation-matin",
      "premiers-pas",
      "affirmation-soi",
      "relations-saines",
    ];

    return [...podcasts].sort((a, b) => {
      const ai = order.indexOf(a.slug);
      const bi = order.indexOf(b.slug);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  },
  ["published-podcasts"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.podcasts],
  }
);

export async function getPodcastBySlug(slug: string) {
  return prisma.podcast.findFirst({
    where: { slug, isPublished: true },
  });
}

export async function getVisibleTestimonials() {
  return getVisibleTestimonialsCached();
}

const getVisibleTestimonialsCached = unstable_cache(
  async () => {
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
      });

      const order = ["نادية ر.", "ليلى د.", "كريم ب.", "سارة م."];

      return [...testimonials].sort((a, b) => {
        const ai = order.indexOf(a.name);
        const bi = order.indexOf(b.name);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    } catch (error) {
      console.error("[content] getVisibleTestimonials:", error);
      return [];
    }
  },
  ["visible-testimonials"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.testimonials],
  }
);

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
