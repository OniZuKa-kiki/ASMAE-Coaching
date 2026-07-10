import { prisma } from "@/lib/db";

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

const SERVICE_HIGHLIGHTS: Record<string, string[]> = {
  individuel: [
    "وضوح في الأهداف",
    "أدوات عملية للتقدم",
    "تعزيز الثقة بالنفس",
    "خطة عمل مخصصة",
  ],
  couple: [
    "تواصل أكثر فاعلية",
    "تعزيز التفاهم المتبادل",
    "إدارة الخلافات وحل النزاعات",
    "تقوية العلاقة",
  ],
  carriere: [
    "رؤية مهنية واضحة",
    "استراتيجية فعالة للانتقال المهني",
    "تعزيز الثقة أثناء المقابلات",
    "تحقيق التوازن بين العمل والحياة",
  ],
  "bien-etre": [
    "إدارة التوتر",
    "تعزيز تقدير الذات",
    "تحقيق التوازن العاطفي",
    "بناء عادات إيجابية",
  ],
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
}

export async function getPublicServices(): Promise<PublicService[]> {
  const services = await getActiveServices();
  return services.map((service) => ({
    ...service,
    duration: formatServiceDuration(service.durationMinutes),
    results: SERVICE_HIGHLIGHTS[service.slug] ?? [],
  }));
}

export async function getPublicServiceBySlug(
  slug: string
): Promise<PublicService | null> {
  const service = await prisma.service.findFirst({
    where: { slug, isActive: true },
  });
  if (!service) return null;

  return {
    slug: service.slug,
    title: service.title,
    description: service.description,
    durationMinutes: service.duration,
    price: service.price,
    duration: formatServiceDuration(service.duration),
    results: SERVICE_HIGHLIGHTS[service.slug] ?? [],
  };
}

export function formatServiceDuration(minutes: number): string {
  return `${minutes} دقيقة`;
}
