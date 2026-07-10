"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { dashboardContent } from "@/lib/constants";
import {
  buildMonthGrid,
  format,
  formatMonthTitle,
  getWeekdayLabels,
  groupBookingsByDate,
  isSameMonth,
  isToday,
  shiftMonth,
  toBookingDateKey,
  type CalendarBookingItem,
} from "@/lib/booking-calendar";
import { dateFnsLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-primary",
  PENDING: "bg-amber-500",
  COMPLETED: "bg-slate-400",
};

type BookingsCalendarProps = {
  bookings: CalendarBookingItem[];
};

export function BookingsCalendar({ bookings }: BookingsCalendarProps) {
  const [month, setMonth] = useState(() => startOfTodayMonth());
  const [selectedKey, setSelectedKey] = useState(() => toBookingDateKey(new Date()));

  const byDate = useMemo(() => groupBookingsByDate(bookings), [bookings]);
  const days = useMemo(() => buildMonthGrid(month), [month]);
  const weekdays = useMemo(() => getWeekdayLabels(), []);
  const selectedBookings = byDate.get(selectedKey) ?? [];

  return (
    <div className="mb-8 space-y-4">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            className="rounded-full border border-border p-2 text-heading hover:border-primary/40 hover:text-primary transition-colors"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="font-heading text-lg font-semibold text-heading">
            {formatMonthTitle(month)}
          </h2>
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            className="rounded-full border border-border p-2 text-heading hover:border-primary/40 hover:text-primary transition-colors"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekdays.map((label) => (
            <div
              key={label}
              className="py-1 text-center text-[10px] sm:text-xs font-medium text-text/60"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const key = toBookingDateKey(day);
            const dayBookings = byDate.get(key) ?? [];
            const isSelected = key === selectedKey;
            const inMonth = isSameMonth(day, month);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={cn(
                  "relative flex min-h-[2.75rem] sm:min-h-[3.25rem] flex-col items-center justify-center rounded-xl border text-sm transition-all",
                  inMonth ? "text-heading" : "text-text/35",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border/60 hover:border-primary/30 hover:bg-primary/5",
                  isToday(day) && !isSelected && "border-primary/40"
                )}
              >
                <span className="font-semibold">{format(day, "d")}</span>
                {dayBookings.length > 0 ? (
                  <span className="mt-1 flex gap-0.5">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <span
                        key={booking.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          statusStyles[booking.status] ?? "bg-primary"
                        )}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-heading text-lg font-semibold text-heading">
          {format(new Date(selectedKey), "EEEE d MMMM yyyy", {
            locale: dateFnsLocale,
          })}
        </h3>

        {selectedBookings.length === 0 ? (
          <p className="text-sm text-text/70 text-center py-6">
            {dashboardContent.bookingsNoSessionsDay}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-heading">
                    {booking.serviceTitle}
                  </p>
                  <p className="text-sm text-text/70">
                    {booking.startTime} — {booking.endTime}
                  </p>
                </div>
                {booking.meetingUrl ? (
                  <a
                    href={booking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    <Video className="h-4 w-4" />
                    {dashboardContent.sessionLink}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function startOfTodayMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}
