import { prisma } from "@/lib/db";

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
