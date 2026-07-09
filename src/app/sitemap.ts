import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const [services, courses, blogPosts, podcasts] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: { slug: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true },
    }),
    prisma.podcast.findMany({
      where: { isPublished: true },
      select: { slug: true },
    }),
  ]);

  const staticPages = [
    "",
    "/about",
    "/services",
    "/booking",
    "/courses",
    "/podcasts",
    "/blog",
    "/testimonials",
    "/contact",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const dynamicPages = [
    ...services.map((service) => `/services/${service.slug}`),
    ...courses.map((course) => `/courses/${course.slug}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...podcasts.map((podcast) => `/podcasts/${podcast.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...dynamicPages];
}
