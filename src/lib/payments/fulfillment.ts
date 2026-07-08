import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { formatBookingDate, slotKeyForStatus } from "@/lib/booking";
import {
  sendBookingConfirmation,
  sendCoursePurchaseConfirmation,
} from "@/lib/email";
import { createMeetingLink } from "@/lib/zoom";
import type { VerifiedPayment } from "./types";

export async function fulfillVerifiedPayment(
  verified: VerifiedPayment
): Promise<void> {
  if (verified.status !== "paid") return;

  const payment = await prisma.payment.findUnique({
    where: { id: verified.metadata.paymentId },
    include: {
      booking: { include: { service: true, user: true } },
      course: true,
      user: true,
    },
  });

  if (!payment || payment.status === "PAID") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      providerPaymentId:
        verified.providerPaymentId || payment.providerPaymentId,
    },
  });

  if (verified.metadata.type === "booking" && payment.booking) {
    const booking = payment.booking;
    if (booking.status !== "PENDING") return;

    const dateStr = format(booking.date, "yyyy-MM-dd");
    const slotKey = slotKeyForStatus(
      "CONFIRMED",
      dateStr,
      booking.startTime
    );

    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        slotKey,
        status: "CONFIRMED",
      },
    });
    if (conflict) return;

    const meetingUrl = await createMeetingLink(
      booking.service.title,
      booking.date
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED", meetingUrl, slotKey },
    });

    const clientName =
      [booking.user.firstName, booking.user.lastName]
        .filter(Boolean)
        .join(" ") || "Client";

    await sendBookingConfirmation({
      to: booking.user.email,
      clientName,
      serviceName: booking.service.title,
      date: formatBookingDate(booking.date),
      time: booking.startTime,
      meetingUrl,
    });
  }

  if (verified.metadata.type === "course" && payment.course) {
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

    await sendCoursePurchaseConfirmation({
      to: user.email,
      clientName,
      courseName: course.title,
    });
  }
}
