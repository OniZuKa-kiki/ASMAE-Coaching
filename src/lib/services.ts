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
    "وضوح في أهداف حياتك",
    "أدوات عملية للتقدم",
    "استعادة الثقة",
    "خطة عمل مخصصة",
  ],
  couple: [
    "تواصل أفضل",
    "تفاهم متبادل",
    "حل النزاعات",
    "تعزيز الرابط",
  ],
  carriere: [
    "رؤية مهنية واضحة",
    "استراتيجية انتقال",
    "ثقة في المقابلات",
    "توازن العمل والحياة",
  ],
  "bien-etre": [
    "إدارة التوتر",
    "تعزيز تقدير الذات",
    "توازن عاطفي",
    "عادات إيجابية",
  ],
};

export async function getActiveServices(): Promise<BookableService[]> {
  const rows = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return rows.map((service) => ({
    slug: service.slug,
    title: service.title,
    description: service.description,
    durationMinutes: service.duration,
    price: service.price,
  }));
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
  return `${minutes} د`;
}
