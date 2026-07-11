import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { formatBookingDate, slotKeyForStatus } from "@/lib/booking";
import {
  sendBookingConfirmation,
  sendCoursePurchaseConfirmation,
} from "@/lib/email";
import { resolveEmailLang } from "@/lib/request-locale";
import {
  notifyBookingConfirmed,
  notifyCoursePurchase,
} from "@/lib/notifications";
import { createMeetingLink } from "@/lib/zoom";
import type { PaymentItemType, VerifiedPayment } from "./types";

export type MarkedPayment = {
  paymentId: string;
  type: PaymentItemType;
};

export async function markPaymentPaid(
  verified: VerifiedPayment
): Promise<MarkedPayment | null> {
  if (verified.status !== "paid") return null;

  const payment = await prisma.payment.findUnique({
    where: { id: verified.metadata.paymentId },
    include: {
      booking: true,
    },
  });

  if (!payment || payment.status === "PAID") return null;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      providerPaymentId:
        verified.providerPaymentId || payment.providerPaymentId,
    },
  });

  return {
    paymentId: payment.id,
    type: verified.metadata.type,
  };
}

export async function fulfillBookingPayment(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { service: true } },
    },
  });

  const booking = payment?.booking;
  if (!booking || booking.status !== "PENDING") return;

  const dateStr = format(booking.date, "yyyy-MM-dd");
  const slotKey = slotKeyForStatus("CONFIRMED", dateStr, booking.startTime);

  const conflict = await prisma.booking.findFirst({
    where: {
      id: { not: booking.id },
      slotKey,
      status: "CONFIRMED",
    },
  });
  if (conflict) return;

  const meetingUrl = await createMeetingLink({
    topic: booking.service.title,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationMinutes: booking.service.duration,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CONFIRMED", meetingUrl, slotKey },
  });
}

export async function sendBookingFulfillmentNotifications(
  paymentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { service: true, user: true } },
    },
  });

  const booking = payment?.booking;
  if (!booking || booking.status !== "CONFIRMED") return;

  const clientName =
    [booking.user.firstName, booking.user.lastName].filter(Boolean).join(" ") ||
    "Client";

  const emailLang = await resolveEmailLang(booking.user.preferredLocale);

  await sendBookingConfirmation({
    to: booking.user.email,
    clientName,
    serviceName: booking.service.title,
    date: formatBookingDate(booking.date),
    time: booking.startTime,
    meetingUrl: booking.meetingUrl ?? undefined,
    lang: emailLang,
  });

  await notifyBookingConfirmed({
    userId: booking.userId,
    bookingId: booking.id,
    serviceTitle: booking.service.title,
    date: booking.date,
    time: booking.startTime,
  });
}

export async function fulfillCoursePayment(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      course: true,
      user: true,
    },
  });

  if (!payment?.course) return;

  const user = payment.user;
  const course = payment.course;

  await prisma.courseEnrollment.upsert({
    where: {
      userId_courseId: { userId: user.id, courseId: course.id },
    },
    update: {},
    create: { userId: user.id, courseId: course.id },
  });

  const clientName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Client";

  const emailLang = await resolveEmailLang(user.preferredLocale);

  await sendCoursePurchaseConfirmation({
    to: user.email,
    clientName,
    courseName: course.title,
    lang: emailLang,
  });

  await notifyCoursePurchase({
    userId: user.id,
    paymentId: payment.id,
    courseId: course.id,
    courseTitle: course.title,
  });
}

export async function fulfillVerifiedPayment(
  verified: VerifiedPayment
): Promise<void> {
  const marked = await markPaymentPaid(verified);
  if (!marked) return;

  if (marked.type === "booking") {
    await fulfillBookingPayment(marked.paymentId);
    await sendBookingFulfillmentNotifications(marked.paymentId);
    return;
  }

  if (marked.type === "course") {
    await fulfillCoursePayment(marked.paymentId);
  }
}
