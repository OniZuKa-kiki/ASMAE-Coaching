import type { MetadataRoute } from "next";
import { siteConfig, services, courses, blogPosts, podcasts } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

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
    ...services.map((s) => `/services/${s.slug}`),
    ...courses.map((c) => `/courses/${c.slug}`),
    ...blogPosts.map((b) => `/blog/${b.slug}`),
    ...podcasts.map((p) => `/podcasts/${p.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...dynamicPages];
}
