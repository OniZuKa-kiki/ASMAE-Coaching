/** Durée de cache pour le contenu public (accueil, services, blog…). */
export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 3600;

/**
 * Dans les pages App Router, utiliser la valeur littérale :
 * `export const revalidate = 3600` (Next.js n'accepte pas les imports ici).
 */

export const PUBLIC_CACHE_TAGS = {
  testimonials: "public-testimonials",
  services: "public-services",
  blog: "public-blog",
  courses: "public-courses",
  podcasts: "public-podcasts",
} as const;

export type PublicCacheTag =
  (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS];
