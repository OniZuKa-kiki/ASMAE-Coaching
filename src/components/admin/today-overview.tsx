"use client";

import Link from "next/link";
import { CreditCard, UserPlus, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardTitle } from "@/components/ui/card";
import {
  CountSummaryChips,
  ListSectionHeader,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import { adminUrl } from "@/lib/admin-path";
import type { AdminTodayOverview } from "@/lib/admin-stats";
import { cn } from "@/lib/utils";

const bookingStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-100 text-slate-700",
};

type BookingStatusKey = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

function isBookingStatusKey(status: string): status is BookingStatusKey {
  return (
    status === "PENDING" ||
    status === "CONFIRMED" ||
    status === "COMPLETED" ||
    status === "CANCELLED"
  );
}

export function AdminTodayOverview({ data }: { data: AdminTodayOverview }) {
  const t = useTranslations("adminPages.todayOverview");
  const tEmpty = useTranslations("adminPages.empty");
  const tMisc = useTranslations("adminPages.misc");
  const tBookingStatus = useTranslations("adminPages.statuses.booking");

  const bookingStatusLabel = (status: string) =>
    isBookingStatusKey(status) ? tBookingStatus(status) : status;

  const metrics = [
    {
      label: t("newClients24h"),
      value: String(data.newClients24h),
      icon: UserPlus,
    },
    {
      label: t("paymentsToday"),
      value: String(data.paymentsToday),
      icon: CreditCard,
    },
    {
      label: t("revenueToday"),
      value: data.revenueToday,
      icon: Wallet,
    },
  ];

  const sessionStatusCounts = data.sessions.reduce<Record<string, number>>(
    (acc, session) => {
      const label = bookingStatusLabel(session.status);
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const moodCounts = data.moodCheckIns.reduce<Record<string, number>>(
    (acc, checkIn) => {
      acc[checkIn.moodLabel] = (acc[checkIn.moodLabel] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl sm:text-2xl">{t("title")}</CardTitle>
          <p className="mt-1 text-sm text-text/70">{data.dateLabel}</p>
        </div>
        <Link
          href={adminUrl("/bookings")}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {t("viewAllBookings")}
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2 text-primary">
              <metric.icon className="h-4 w-4" />
              <span className="text-xs text-text/70">{metric.label}</span>
            </div>
            <p className="text-xl font-semibold text-heading">{metric.value}</p>
          </div>
        ))}
      </div>

      <div>
        <ListSectionHeader
          title={t("sessionsToday")}
          count={data.sessions.length}
        />

        {data.sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-text/70">
            {tEmpty("noSessionsToday")}
          </p>
        ) : (
          <>
            <CountSummaryChips counts={sessionStatusCounts} />
            <ScrollableItemList count={data.sessions.length}>
              {data.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-heading">
                        {session.startTime} — {session.endTime}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          bookingStatusStyles[session.status] ??
                            "bg-slate-100 text-slate-700"
                        )}
                      >
                        {bookingStatusLabel(session.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text/80">
                      {session.clientName} · {session.serviceTitle}
                    </p>
                    {session.notes ? (
                      <p className="mt-2 text-xs text-text/60 line-clamp-2">
                        {session.notes}
                      </p>
                    ) : null}
                    {session.moodLabel ? (
                      <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-primary">
                        {session.moodEmoji ? (
                          <span aria-hidden>{session.moodEmoji}</span>
                        ) : null}
                        <span>
                          {tMisc("moodToday", { label: session.moodLabel })}
                        </span>
                        {session.moodNote ? (
                          <span className="text-text/60 line-clamp-1">
                            — {session.moodNote}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </ScrollableItemList>
          </>
        )}
      </div>

      {data.moodCheckIns.length > 0 ? (
        <div className="mt-8 border-t border-border/60 pt-6">
          <ListSectionHeader
            title={t("moodTodayTitle")}
            count={data.moodCheckIns.length}
          />

          <CountSummaryChips counts={moodCounts} />

          <ScrollableItemList count={data.moodCheckIns.length} layout="grid">
            {data.moodCheckIns.map((checkIn, index) => (
              <div
                key={`${checkIn.clientName}-${index}`}
                className="rounded-2xl border border-border/60 bg-card px-3 py-2.5"
                title={checkIn.moodNote ?? undefined}
              >
                <div className="flex min-w-0 items-start gap-2">
                  {checkIn.moodEmoji ? (
                    <span className="shrink-0 text-base" aria-hidden>
                      {checkIn.moodEmoji}
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">
                      {checkIn.clientName}
                    </p>
                    <p className="text-xs font-medium text-primary">
                      {checkIn.moodLabel}
                    </p>
                    {checkIn.moodNote ? (
                      <p className="mt-1 line-clamp-2 text-xs text-text/60">
                        {checkIn.moodNote}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </ScrollableItemList>
        </div>
      ) : null}
    </Card>
  );
}
