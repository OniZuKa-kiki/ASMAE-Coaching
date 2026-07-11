"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardTitle } from "@/components/ui/card";
import { adminUrl } from "@/lib/admin-path";
import type { AdminAdvancedStats } from "@/lib/admin-stats";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function AdminAdvancedStats({ data }: { data: AdminAdvancedStats }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("adminPages.advancedStats");
  const tEmpty = useTranslations("adminPages.empty");
  const tMisc = useTranslations("adminPages.misc");

  const metrics = [
    { label: t("sessionsThisWeek"), value: String(data.sessionsThisWeek) },
    { label: t("sessionsTomorrow"), value: String(data.sessionsTomorrow) },
    { label: t("completedThisMonth"), value: String(data.completedThisMonth) },
    { label: t("cancellationRate"), value: data.cancellationRate },
    { label: t("repeatClients"), value: String(data.repeatClients) },
    {
      label: t("remindersTomorrow"),
      value: `${data.remindersSentTomorrow}/${data.sessionsTomorrow}`,
    },
  ];

  const moodTotal =
    data.moodThisWeek.happy + data.moodThisWeek.neutral + data.moodThisWeek.low;

  return (
    <section className="mb-10 space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-heading">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-text/70">{t("subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((item) => (
          <Card key={item.label} className="px-4 py-3">
            <p className="text-xs text-text/60">{item.label}</p>
            <p className="mt-1 font-heading text-lg font-semibold text-heading">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">{t("moodWeekTitle")}</CardTitle>
          {moodTotal === 0 ? (
            <p className="text-sm text-text/70">{tEmpty("noMoodLogs")}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p>{t("moodHappy", { count: data.moodThisWeek.happy })}</p>
              <p>{t("moodNeutral", { count: data.moodThisWeek.neutral })}</p>
              <p>{t("moodLow", { count: data.moodThisWeek.low })}</p>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">{t("topServicesTitle")}</CardTitle>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-text/70">{tEmpty("noData")}</p>
          ) : (
            <ul className="space-y-3">
              {data.topServices.map((service) => (
                <li
                  key={service.title}
                  className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-heading">
                    {service.title}
                  </span>
                  <span className="text-xs text-text/70">
                    {tMisc("bookingsCount", { count: service.bookings })}
                    {tMisc("bookingsCountSeparator")}
                    {service.revenueLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <CardTitle>{t("tomorrowSessionsTitle")}</CardTitle>
          <Link
            href={adminUrl("/settings/emails")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("emailSettings")}
          </Link>
        </div>
        {data.tomorrowSessions.length === 0 ? (
          <p className="text-sm text-text/70">{tEmpty("noSessionsTomorrow")}</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {data.tomorrowSessions.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-heading">{session.clientName}</p>
                  <p className="text-sm text-text/70">
                    {session.serviceTitle} · {session.startTime}–
                    {session.endTime}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium",
                    session.reminderSent
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  )}
                >
                  {session.reminderSent
                    ? tMisc("reminderSent")
                    : tMisc("reminderPending")}
                </span>
              </li>
            ))}
          </ul>
        )}
        {data.remindersPendingTomorrow > 0 ? (
          <p className="mt-4 text-xs text-text/60">{tMisc("reminderAutoNote")}</p>
        ) : null}
      </Card>
    </section>
  );
}
