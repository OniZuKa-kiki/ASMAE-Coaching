import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { dateFnsLocale } from "@/lib/locale";

export type CalendarBookingItem = {
  id: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingUrl: string | null;
  serviceTitle: string;
};

export function toBookingDateKey(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd");
}

export function groupBookingsByDate(
  bookings: CalendarBookingItem[]
): Map<string, CalendarBookingItem[]> {
  const map = new Map<string, CalendarBookingItem[]>();
  for (const booking of bookings) {
    const list = map.get(booking.dateKey) ?? [];
    list.push(booking);
    map.set(booking.dateKey, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return map;
}

export function buildMonthGrid(month: Date): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { locale: dateFnsLocale });
  const gridEnd = endOfWeek(monthEnd, { locale: dateFnsLocale });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function getWeekdayLabels(): string[] {
  const ref = startOfWeek(new Date(), { locale: dateFnsLocale });
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(ref);
    day.setDate(ref.getDate() + index);
    return format(day, "EEEEEE", { locale: dateFnsLocale });
  });
}

export function formatMonthTitle(month: Date): string {
  return format(month, "MMMM yyyy", { locale: dateFnsLocale });
}

export function shiftMonth(month: Date, delta: number): Date {
  return delta >= 0 ? addMonths(month, delta) : subMonths(month, Math.abs(delta));
}

export {
  format,
  isSameDay,
  isSameMonth,
  isToday,
  toBookingDateKey as formatDateKey,
};
