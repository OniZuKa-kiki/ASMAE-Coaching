export const bookingReasons = [
  { id: "stress", label: "التوتر والضغط" },
  { id: "confidence", label: "الثقة بالنفس" },
  { id: "couple", label: "العلاقات والزوجية" },
  { id: "career", label: "العمل والمهنة" },
  { id: "other", label: "أخرى" },
] as const;

export type BookingReasonId = (typeof bookingReasons)[number]["id"];

const reasonLabels = Object.fromEntries(
  bookingReasons.map((reason) => [reason.id, reason.label])
) as Record<BookingReasonId, string>;

export function formatBookingIntentNotes(
  reason: BookingReasonId,
  detail?: string
): string {
  const label = reasonLabels[reason];
  if (reason === "other" && detail?.trim()) {
    return `سبب الحجز: ${label} — ${detail.trim()}`;
  }
  return `سبب الحجز: ${label}`;
}

export const BOOKING_REASON_IDS = bookingReasons.map((reason) => reason.id);

export function getBookingReasonLabel(id: BookingReasonId): string {
  return reasonLabels[id];
}

export function isBookingReasonId(value: string): value is BookingReasonId {
  return bookingReasons.some((reason) => reason.id === value);
}
