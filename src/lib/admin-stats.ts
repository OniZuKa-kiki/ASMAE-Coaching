import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { dateFnsLocale } from "@/lib/locale";
import { getJournalMoodDisplay } from "@/lib/journal-moods";
import { formatProviderAmount } from "@/lib/payments/currency";
import { formatPrice } from "@/lib/utils";

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
  groups: { currency: string; _sum: { amount: number | null } }[]
): string {
  const eur = groups.find((group) => group.currency.toLowerCase() === "eur");
  const mad = groups.find((group) => group.currency.toLowerCase() === "mad");

  if (eur?._sum?.amount) {
    return formatPrice(eur._sum.amount, "EUR");
  }
  if (mad?._sum?.amount) {
    return formatProviderAmount(mad._sum.amount, "mad");
  }
  return formatPrice(0, "EUR");
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

export async function getAdminTodayOverview(): Promise<AdminTodayOverview> {
  const now = new Date();
  const { dayStart, dayEnd } = getTodayBounds(now);
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
      const display = getJournalMoodDisplay(entry.mood);
      return [
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
    dateLabel: format(now, "EEEE d MMMM yyyy", { locale: dateFnsLocale }),
    newClients24h,
    paymentsToday,
    revenueToday: sumPaidRevenue(revenueTodayGroups),
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
            .join(" ") || "عميلة",
        serviceTitle: booking.service.title,
        notes: booking.notes,
        moodEmoji: mood?.emoji ?? null,
        moodLabel: mood?.label ?? null,
        moodNote: mood?.note ?? null,
      };
    }),
    moodCheckIns: moodEntries.map((entry) => {
      const display = getJournalMoodDisplay(entry.mood);
      return {
        clientName:
          [entry.user.firstName, entry.user.lastName].filter(Boolean).join(" ") ||
          "عميلة",
        moodEmoji: display?.emoji ?? null,
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

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { start, end, prevStart, prevEnd } = getMonthBounds();

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

  const revenueThisMonthTotal = sumPaidRevenue(revenueThisMonth);
  const revenueLastMonthTotal = sumPaidRevenue(revenueLastMonth);

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
