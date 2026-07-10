import "server-only";

import { prisma } from "@/lib/db";

export type SessionReviewSnapshot = {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

export type ReviewableBooking = {
  id: string;
  date: Date;
  startTime: string;
  service: { title: string };
  review: SessionReviewSnapshot | null;
};

const MIN_RATING = 1;
const MAX_RATING = 5;

export function isValidSessionRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING;
}

export function isBookingReviewable(
  booking: { status: string; date: Date },
  now = new Date()
): boolean {
  if (booking.status === "COMPLETED") return true;
  if (booking.status === "CONFIRMED") {
    return new Date(booking.date) < now;
  }
  return false;
}

export function parseSessionReviewComment(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

export async function getReviewableBookingsForUser(
  userId: string
): Promise<ReviewableBooking[]> {
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      review: null,
    },
    include: {
      service: { select: { title: true } },
      review: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 20,
  });

  return bookings
    .filter((booking) => isBookingReviewable(booking, now))
    .map((booking) => ({
      id: booking.id,
      date: booking.date,
      startTime: booking.startTime,
      service: booking.service,
      review: null,
    }));
}

export async function getPendingSessionReview(userId: string) {
  const reviewable = await getReviewableBookingsForUser(userId);
  return reviewable[0] ?? null;
}
