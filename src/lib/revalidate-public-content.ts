import { revalidatePath, updateTag } from "next/cache";
import {
  PUBLIC_CACHE_TAGS,
  type PublicCacheTag,
} from "@/lib/public-cache";

export function invalidatePublicContent(
  paths: string[],
  tag: PublicCacheTag
) {
  for (const path of paths) {
    revalidatePath(path);
  }
  updateTag(tag);
}

export const PUBLIC_INVALIDATIONS = {
  testimonials: () =>
    invalidatePublicContent(["/", "/testimonials"], PUBLIC_CACHE_TAGS.testimonials),
  services: (slug?: string) =>
    invalidatePublicContent(
      slug ? ["/services", `/services/${slug}`, "/booking"] : ["/services", "/booking"],
      PUBLIC_CACHE_TAGS.services
    ),
  blog: (slug?: string) =>
    invalidatePublicContent(
      slug ? ["/blog", `/blog/${slug}`] : ["/blog"],
      PUBLIC_CACHE_TAGS.blog
    ),
  courses: (slug?: string) =>
    invalidatePublicContent(
      slug ? ["/courses", `/courses/${slug}`] : ["/courses"],
      PUBLIC_CACHE_TAGS.courses
    ),
  podcasts: (slug?: string) =>
    invalidatePublicContent(
      slug ? ["/podcasts", `/podcasts/${slug}`] : ["/podcasts"],
      PUBLIC_CACHE_TAGS.podcasts
    ),
} as const;
