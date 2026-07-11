import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import {
  PUBLIC_CACHE_TAGS,
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
} from "@/lib/public-cache";
import type { AppLocale } from "@/i18n/routing";
import {
  formatServiceDurationLabel,
  getServiceHighlights,
} from "@/lib/service-i18n";

export type BookableService = {
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
};

export type PublicService = BookableService & {
  duration: string;
  results: string[];
};

const SERVICE_DISPLAY_ORDER = [
  "individuel",
  "bien-etre",
  "carriere",
  "couple",
] as const;

function sortServices<T extends { slug: string }>(services: T[]): T[] {
  return [...services].sort((a, b) => {
    const ai = SERVICE_DISPLAY_ORDER.indexOf(
      a.slug as (typeof SERVICE_DISPLAY_ORDER)[number]
    );
    const bi = SERVICE_DISPLAY_ORDER.indexOf(
      b.slug as (typeof SERVICE_DISPLAY_ORDER)[number]
    );
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export async function getActiveServices(): Promise<BookableService[]> {
  return getActiveServicesCached();
}

const getActiveServicesCached = unstable_cache(
  async (): Promise<BookableService[]> => {
    const rows = await prisma.service.findMany({
      where: { isActive: true },
    });

    return sortServices(
      rows.map((service) => ({
        slug: service.slug,
        title: service.title,
        description: service.description,
        durationMinutes: service.duration,
        price: service.price,
      }))
    );
  },
  ["active-services"],
  {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.services],
  }
);

export async function getPublicServices(
  locale: AppLocale = "ar"
): Promise<PublicService[]> {
  const [services, highlights] = await Promise.all([
    getActiveServices(),
    getServiceHighlights(locale),
  ]);

  return Promise.all(
    services.map(async (service) => ({
      ...service,
      duration: await formatServiceDurationLabel(
        service.durationMinutes,
        locale
      ),
      results: highlights[service.slug] ?? [],
    }))
  );
}

export async function getPublicServiceBySlug(
  slug: string,
  locale: AppLocale = "ar"
): Promise<PublicService | null> {
  const service = await prisma.service.findFirst({
    where: { slug, isActive: true },
  });
  if (!service) return null;

  const highlights = await getServiceHighlights(locale);

  return {
    slug: service.slug,
    title: service.title,
    description: service.description,
    durationMinutes: service.duration,
    price: service.price,
    duration: await formatServiceDurationLabel(service.duration, locale),
    results: highlights[service.slug] ?? [],
  };
}
