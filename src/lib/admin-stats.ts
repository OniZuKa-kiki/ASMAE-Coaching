import { format } from "date-fns";
import type { AppLocale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { getAdminPagesCopy } from "@/lib/admin-i18n";
import { dateFnsLocaleFor } from "@/lib/locale";
import { getJournalMoodDisplay } from "@/lib/journal-moods-i18n";
import { formatProviderAmount } from "@/lib/payments/currency";
import { formatPrice } from "@/lib/utils";import {
  getParisTomorrowYmd,
  getParisWeekStartYmd,
  getParisYmd,
} from "@/lib/paris-time";

type MonthBounds = {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
};

function getMonthBounds(date = new Date()): MonthBounds {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  const prevStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const prevEnd = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
  return { start, end, prevStart, prevEnd };
}

function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "+0%";
  }
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : ""}${change}%`;
}

function sumPaidRevenue(
  groups: { currency: string; _sum: { amount: number | null } }[],
  locale: AppLocale
): string {
  const eur = groups.find((group) => group.currency.toLowerCase() === "eur");
  const mad = groups.find((group) => group.currency.toLowerCase() === "mad");

  if (eur?._sum?.amount) {
    return formatPrice(eur._sum.amount, "EUR", locale);
  }
  if (mad?._sum?.amount) {
    return formatProviderAmount(mad._sum.amount, "mad");
  }
  return formatPrice(0, "EUR", locale);
}
function getTodayBounds(date = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

export type AdminTodaySession = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName: string;
  serviceTitle: string;
  notes: string | null;
  moodEmoji: string | null;
  moodLabel: string | null;
  moodNote: string | null;
};

export type AdminTodayMoodCheckIn = {
  clientName: string;
  moodEmoji: string | null;
  moodLabel: string;
  moodNote: string | null;
};

export type AdminTodayOverview = {
  dateLabel: string;
  newClients24h: number;
  paymentsToday: number;
  revenueToday: string;
  sessions: AdminTodaySession[];
  moodCheckIns: AdminTodayMoodCheckIn[];
};

export async function getAdminTodayOverview(
  locale: AppLocale
): Promise<AdminTodayOverview> {
  const copy = getAdminPagesCopy(locale);
  const now = new Date();  const { dayStart, dayEnd } = getTodayBounds(now);
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [sessions, moodEntries, newClients24h, paymentsToday, revenueTodayGroups] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          date: { gte: dayStart, lte: dayEnd },
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
        include: { user: true, service: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.moodCheckIn.findMany({
        where: { checkInDate: { gte: dayStart, lte: dayEnd } },
        include: { user: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.count({
        where: { role: "CLIENT", createdAt: { gte: since24h } },
      }),
      prisma.payment.count({
        where: { status: "PAID", createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.payment.groupBy({
        by: ["currency"],
        where: { status: "PAID", createdAt: { gte: dayStart, lte: dayEnd } },
        _sum: { amount: true },
      }),
    ]);

  const moodByUserId = new Map(
    moodEntries.map((entry) => {
      const display = getJournalMoodDisplay(entry.mood, locale);      return [
        entry.userId,
        {
          emoji: display?.emoji ?? null,
          label: display?.label ?? entry.mood,
          note: entry.note,
        },
      ] as const;
    })
  );

  return {
    dateLabel: format(now, "EEEE d MMMM yyyy", {
      locale: dateFnsLocaleFor(locale),
    }),
    newClients24h,
    paymentsToday,
    revenueToday: sumPaidRevenue(revenueTodayGroups, locale),
    sessions: sessions.map((booking) => {
      const mood = moodByUserId.get(booking.userId);
      return {
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        clientName:
          [booking.user.firstName, booking.user.lastName]
            .filter(Boolean)
            .join(" ") || copy.misc.clientFallback,
        serviceTitle: booking.service.title,
        notes: booking.notes,
        moodEmoji: mood?.emoji ?? null,
        moodLabel: mood?.label ?? null,
        moodNote: mood?.note ?? null,
      };
    }),
    moodCheckIns: moodEntries.map((entry) => {
      const display = getJournalMoodDisplay(entry.mood, locale);
      return {
        clientName:
          [entry.user.firstName, entry.user.lastName].filter(Boolean).join(" ") ||
          copy.misc.clientFallback,        moodEmoji: display?.emoji ?? null,
        moodLabel: display?.label ?? entry.mood,
        moodNote: entry.note,
      };
    }),
  };
}

export type AdminDashboardStats = {
  clients: { value: number; change: string };
  bookingsThisMonth: { value: number; change: string };
  revenueThisMonth: { value: string; change: string };
  conversionRate: { value: string; change: string };
  hasActivity: boolean;
};

export async function getAdminDashboardStats(
  locale: AppLocale
): Promise<AdminDashboardStats> {  const { start, end, prevStart, prevEnd } = getMonthBounds();

  const [
    clients,
    newClientsThisMonth,
    newClientsLastMonth,
    bookingsThisMonth,
    bookingsLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    paidBookingsThisMonth,
    paidBookingsLastMonth,
    totalBookingsThisMonth,
    totalBookingsLastMonth,
    totalBookings,
    totalPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({
      where: { role: "CLIENT", createdAt: { gte: start, lte: end } },
    }),
    prisma.user.count({
      where: { role: "CLIENT", createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.payment.groupBy({
      by: ["currency"],
      where: { status: "PAID", createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["currency"],
      where: { status: "PAID", createdAt: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: start, lte: end },
        payment: { status: "PAID" },
      },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: prevStart, lte: prevEnd },
        payment: { status: "PAID" },
      },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: start, lte: end } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.booking.count(),
    prisma.payment.count({ where: { status: "PAID" } }),
  ]);

  const conversionThisMonth =
    totalBookingsThisMonth === 0
      ? 0
      : Math.round((paidBookingsThisMonth / totalBookingsThisMonth) * 100);
  const conversionLastMonth =
    totalBookingsLastMonth === 0
      ? 0
      : Math.round((paidBookingsLastMonth / totalBookingsLastMonth) * 100);

  const revenueThisMonthTotal = sumPaidRevenue(revenueThisMonth, locale);
  const revenueLastMonthTotal = sumPaidRevenue(revenueLastMonth, locale);
  const revenueThisMonthCents =
    revenueThisMonth.find((group) => group.currency.toLowerCase() === "eur")
      ?._sum?.amount ??
    revenueThisMonth.find((group) => group.currency.toLowerCase() === "mad")
      ?._sum?.amount ??
    0;
  const revenueLastMonthCents =
    revenueLastMonth.find((group) => group.currency.toLowerCase() === "eur")
      ?._sum?.amount ??
    revenueLastMonth.find((group) => group.currency.toLowerCase() === "mad")
      ?._sum?.amount ??
    0;

  return {
    clients: {
      value: clients,
      change: formatPercentChange(newClientsThisMonth, newClientsLastMonth),
    },
    bookingsThisMonth: {
      value: bookingsThisMonth,
      change: formatPercentChange(bookingsThisMonth, bookingsLastMonth),
    },
    revenueThisMonth: {
      value: revenueThisMonthTotal,
      change: formatPercentChange(revenueThisMonthCents, revenueLastMonthCents),
    },
    conversionRate: {
      value: `${conversionThisMonth}%`,
      change: formatPercentChange(conversionThisMonth, conversionLastMonth),
    },
    hasActivity: clients > 0 || totalBookings > 0 || totalPayments > 0,
  };
}

export type AdminTomorrowSession = {
  id: string;
  startTime: string;
  endTime: string;
  clientName: string;
  serviceTitle: string;
  reminderSent: boolean;
};

export type AdminTopService = {
  title: string;
  bookings: number;
  revenueLabel: string;
};

export type AdminAdvancedStats = {
  sessionsThisWeek: number;
  sessionsTomorrow: number;
  completedThisMonth: number;
  cancelledThisMonth: number;
  cancellationRate: string;
  repeatClients: number;
  remindersSentTomorrow: number;
  remindersPendingTomorrow: number;
  moodThisWeek: { happy: number; neutral: number; low: number };
  topServices: AdminTopService[];
  tomorrowSessions: AdminTomorrowSession[];
};

export async function getAdminAdvancedStats(
  locale: AppLocale
): Promise<AdminAdvancedStats> {
  const copy = getAdminPagesCopy(locale);
  const now = new Date();  const { start, end } = getMonthBounds(now);
  const weekStartYmd = getParisWeekStartYmd(now);
  const tomorrowYmd = getParisTomorrowYmd(now);

  const [
    bookingsThisMonth,
    completedThisMonth,
    cancelledThisMonth,
    moodThisWeek,
    paidBookingsWithService,
    upcomingConfirmed,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { id: true, status: true, userId: true },
    }),
    prisma.booking.count({
      where: {
        status: "COMPLETED",
        updatedAt: { gte: start, lte: end },
      },
    }),
    prisma.booking.count({
      where: {
        status: "CANCELLED",
        updatedAt: { gte: start, lte: end },
      },
    }),
    prisma.moodCheckIn.findMany({
      where: {
        checkInDate: {
          gte: new Date(`${weekStartYmd}T00:00:00`),
        },
      },
      select: { mood: true },
    }),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        payment: { status: "PAID" },
      },
      include: {
        service: { select: { title: true } },
        payment: { select: { amount: true, currency: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        date: { gte: now },
      },
      include: { user: true, service: true },
      orderBy: { date: "asc" },
      take: 80,
    }),
  ]);

  const sessionsThisWeek = upcomingConfirmed.filter(
    (booking) => getParisYmd(booking.date) >= weekStartYmd
  ).length;

  const tomorrowSessions = upcomingConfirmed
    .filter((booking) => getParisYmd(booking.date) === tomorrowYmd)
    .map((booking) => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      clientName:
        [booking.user.firstName, booking.user.lastName].filter(Boolean).join(" ") ||
        copy.misc.clientFallback,      serviceTitle: booking.service.title,
      reminderSent: Boolean(booking.reminderEmailSentAt),
    }));

  const remindersSentTomorrow = tomorrowSessions.filter((s) => s.reminderSent).length;
  const remindersPendingTomorrow = tomorrowSessions.length - remindersSentTomorrow;

  const completedByUser = new Map<string, number>();
  for (const booking of bookingsThisMonth) {
    if (booking.status !== "COMPLETED") continue;
    completedByUser.set(booking.userId, (completedByUser.get(booking.userId) ?? 0) + 1);
  }
  const repeatClients = [...completedByUser.values()].filter((count) => count >= 2).length;

  const totalMonth = bookingsThisMonth.length;
  const cancellationRate =
    totalMonth === 0
      ? "0%"
      : `${Math.round((cancelledThisMonth / totalMonth) * 100)}%`;

  const moodCounts = { happy: 0, neutral: 0, low: 0 };
  for (const entry of moodThisWeek) {
    if (entry.mood === "happy") moodCounts.happy += 1;
    else if (entry.mood === "low") moodCounts.low += 1;
    else moodCounts.neutral += 1;
  }

  const serviceMap = new Map<string, { bookings: number; revenueCents: number; currency: string }>();
  for (const booking of paidBookingsWithService) {
    const title = booking.service.title;
    const current = serviceMap.get(title) ?? {
      bookings: 0,
      revenueCents: 0,
      currency: booking.payment?.currency ?? "eur",
    };
    current.bookings += 1;
    current.revenueCents += booking.payment?.amount ?? 0;
    serviceMap.set(title, current);
  }

  const topServices: AdminTopService[] = [...serviceMap.entries()]
    .map(([title, data]) => ({
      title,
      bookings: data.bookings,
      revenueLabel:
        data.currency.toLowerCase() === "mad"
          ? formatProviderAmount(data.revenueCents, "mad")
          : formatPrice(data.revenueCents, "EUR", locale),    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  return {
    sessionsThisWeek,
    sessionsTomorrow: tomorrowSessions.length,
    completedThisMonth,
    cancelledThisMonth,
    cancellationRate,
    repeatClients,
    remindersSentTomorrow,
    remindersPendingTomorrow,
    moodThisWeek: moodCounts,
    topServices,
    tomorrowSessions,
  };
}
