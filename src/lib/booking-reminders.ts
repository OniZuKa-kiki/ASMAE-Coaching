import "server-only";

import { addHours } from "date-fns";
import { formatBookingDate } from "@/lib/booking";
import { sendBookingReminder } from "@/lib/email";
import {
  bookingReminderNotification,
  notificationLocale,
} from "@/lib/notification-copy";
import { upsertNotification } from "@/lib/notifications";
import { toEmailLang } from "@/lib/user-locale";
import { getParisTomorrowYmd, getParisYmd } from "@/lib/paris-time";
import { prisma } from "@/lib/db";

export type BookingReminderResult = {
  sent: number;
  skipped: number;
  errors: string[];
};

export async function processBookingReminders(): Promise<BookingReminderResult> {
  const now = new Date();
  const tomorrowParis = getParisTomorrowYmd(now);
  const horizon = addHours(now, 72);

  const candidates = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderEmailSentAt: null,
      date: { gte: now, lte: horizon },
    },
    include: {
      user: true,
      service: true,
    },
    orderBy: { date: "asc" },
  });

  const toRemind = candidates.filter(
    (booking) => getParisYmd(booking.date) === tomorrowParis
  );

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const booking of toRemind) {
    const lang = toEmailLang(booking.user.preferredLocale);
    const locale = notificationLocale(lang);
    const clientName =
      [booking.user.firstName, booking.user.lastName].filter(Boolean).join(" ") ||
      (lang === "fr" ? "Client" : "عميل");
    const formattedDate = formatBookingDate(booking.date, locale);

    if (!booking.user.email) {
      skipped += 1;
      continue;
    }

    try {
      await sendBookingReminder({
        to: booking.user.email,
        clientName,
        serviceName: booking.service.title,
        date: formattedDate,
        time: booking.startTime,
        meetingUrl: booking.meetingUrl ?? undefined,
        lang,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderEmailSentAt: new Date() },
      });

      const copy = bookingReminderNotification(lang, {
        service: booking.service.title,
        date: formattedDate,
        time: booking.startTime,
      });
      await upsertNotification({
        userId: booking.userId,
        type: "BOOKING_REMINDER",
        title: copy.title,
        body: copy.body,
        href: "/dashboard/bookings",
        dedupeKey: `booking-reminder-email:${booking.id}`,
      });

      sent += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur d'envoi inconnue";
      errors.push(`${booking.id}: ${message}`);
    }
  }

  return { sent, skipped, errors };
}
