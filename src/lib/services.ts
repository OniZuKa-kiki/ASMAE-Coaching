import { prisma } from "@/lib/db";

export type BookableService = {
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
};

export async function getActiveServices(): Promise<BookableService[]> {
  const rows = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return rows.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    durationMinutes: s.duration,
    price: s.price,
  }));
}

export async function getServiceBySlug(
  slug: string
): Promise<BookableService | null> {
  const s = await prisma.service.findFirst({
    where: { slug, isActive: true },
  });
  if (!s) return null;
  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    durationMinutes: s.duration,
    price: s.price,
  };
}

export function formatServiceDuration(minutes: number): string {
  return `${minutes} د`;
}
