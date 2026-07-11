import { format, parse } from "date-fns";
import type { AppLocale } from "@/i18n/routing";
import { dateFnsLocale, dateFnsLocaleFor } from "@/lib/locale";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const SLOT_INTERVAL = 60; // minutes
const PENDING_HOLD_MINUTES = 15;

export class SlotUnavailableError extends Error {
  constructor() {
    super("SLOT_UNAVAILABLE");
    this.name = "SlotUnavailableError";
  }
}

export function buildSlotKey(dateStr: string, startTime: string): string {
  return `${dateStr}|${startTime}`;
}

function getDayBounds(dateStr: string) {
  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

export async function expireStalePendingBookings(
  tx: Prisma.TransactionClient = prisma
) {
  const cutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000);

  await tx.booking.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      slotKey: { not: null },
      OR: [{ payment: null }, { payment: { status: { not: "PAID" } } }],
    },
    data: { status: "CANCELLED", slotKey: null },
  });
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function computeEndTime(startTime: string, durationMinutes: number): string {
  return minutesToTime(parseTimeToMinutes(startTime) + durationMinutes);
}

export function buildBookingDateTime(dateStr: string, startTime: string): Date {
  const base = parse(dateStr, "yyyy-MM-dd", new Date());
  const [hours, minutes] = startTime.split(":").map(Number);
  base.setHours(hours, minutes, 0, 0);
  return base;
}

export async function getAvailableSlots(
  dateStr: string,
  serviceSlug: string
): Promise<string[]> {
  await expireStalePendingBookings();

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug, isActive: true },
  });
  if (!service) return [];

  const date = parse(dateStr, "yyyy-MM-dd", new Date());
  const dayOfWeek = date.getDay();

  const availabilities = await prisma.availability.findMany({
    where: { dayOfWeek, isActive: true },
  });
  if (availabilities.length === 0) return [];

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookings = await prisma.booking.findMany({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  const bookedTimes = new Set(existingBookings.map((b) => b.startTime));
  const slots: string[] = [];

  for (const avail of availabilities) {
    let cursor = parseTimeToMinutes(avail.startTime);
    const end = parseTimeToMinutes(avail.endTime);

    while (cursor + service.duration <= end) {
      const slot = minutesToTime(cursor);
      if (!bookedTimes.has(slot)) {
        slots.push(slot);
      }
      cursor += SLOT_INTERVAL;
    }
  }

  return slots.sort();
}

export function formatBookingDate(date: Date, locale?: AppLocale): string {
  const loc = locale ? dateFnsLocaleFor(locale) : dateFnsLocale;
  return format(date, "EEEE d MMMM yyyy", { locale: loc });
}

export async function isSlotAvailable(
  dateStr: string,
  startTime: string,
  serviceSlug: string
): Promise<boolean> {
  const slots = await getAvailableSlots(dateStr, serviceSlug);
  return slots.includes(startTime);
}

interface ReserveBookingSlotInput {
  userId: string;
  serviceId: string;
  dateStr: string;
  startTime: string;
  serviceSlug: string;
  notes?: string;
}

export async function reserveBookingSlot(input: ReserveBookingSlotInput) {
  const { userId, serviceId, dateStr, startTime, serviceSlug, notes } = input;

  const available = await isSlotAvailable(dateStr, startTime, serviceSlug);
  if (!available) {
    throw new SlotUnavailableError();
  }

  const bookingDate = buildBookingDateTime(dateStr, startTime);
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { duration: true },
  });
  if (!service) {
    throw new Error("Service introuvable");
  }

  const endTime = computeEndTime(startTime, service.duration);
  const slotKey = buildSlotKey(dateStr, startTime);
  const { dayStart, dayEnd } = getDayBounds(dateStr);

  try {
    return await prisma.$transaction(
      async (tx) => {
        await expireStalePendingBookings(tx);

        await tx.$executeRaw`
          SELECT id FROM "Booking"
          WHERE date >= ${dayStart} AND date <= ${dayEnd}
          AND status IN ('PENDING', 'CONFIRMED')
          FOR UPDATE
        `;

        const conflict = await tx.booking.findFirst({
          where: {
            slotKey,
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        });
        if (conflict) {
          throw new SlotUnavailableError();
        }

        return tx.booking.create({
          data: {
            userId,
            serviceId,
            date: bookingDate,
            startTime,
            endTime,
            status: "PENDING",
            slotKey,
            notes: notes?.trim() || null,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new SlotUnavailableError();
    }
    throw error;
  }
}

export function slotKeyForStatus(
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  dateStr: string,
  startTime: string
): string | null {
  if (status === "PENDING" || status === "CONFIRMED") {
    return buildSlotKey(dateStr, startTime);
  }
  return null;
}
