import type { Metadata } from "next";
import { format } from "date-fns";
import { Video } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BookingsCalendar } from "@/components/dashboard/bookings-calendar";
import { SessionReviewDisplay } from "@/components/dashboard/session-review-display";
import { SessionReviewForm } from "@/components/dashboard/session-review-form";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import { getUserBookingsPageData } from "@/lib/dashboard";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { isBookingReviewable } from "@/lib/session-review";
import { dateFnsLocaleFor } from "@/lib/locale";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/bookings",
    namespace: "dashboard",
    titleKey: "bookingsTitle",
    descriptionKey: "bookNextSession",
  });
}

export default async function DashboardBookingsPage() {
  const [data, locale, t] = await Promise.all([
    getUserBookingsPageData(),
    getLocale() as Promise<AppLocale>,
    getTranslations("dashboard"),
  ]);
  const now = new Date();
  const dateLocale = dateFnsLocaleFor(locale);

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("bookingsTitle")}</h1>
      <p className="text-text/70 mb-6">{t("bookingsCalendarLabel")}</p>

      <BookingsCalendar bookings={data?.calendarItems ?? []} />

      <div className="space-y-6">
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-body font-semibold text-heading">
              {t("bookingsUpcoming")}
            </h2>
            <ListScrollHint count={data?.upcoming.length ?? 0} />
          </div>
          {!data || data.upcoming.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text/70 mb-4">{t("noScheduledSessions")}</p>
              <ButtonLink href="/booking">{t("bookSession")}</ButtonLink>
            </Card>
          ) : (
            <ScrollableItemList count={data.upcoming.length}>
              {data.upcoming.map((booking) => (
                <Card key={booking.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-heading">
                        {booking.service.title}
                      </h3>
                      <p className="text-sm text-text/70">
                        {format(booking.date, "EEEE d MMMM yyyy", {
                          locale: dateLocale,
                        })}{" "}
                        {t("bookingAtTime", { time: booking.startTime })}
                      </p>
                    </div>
                    {booking.meetingUrl && (
                      <a
                        href={booking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        <Video className="w-4 h-4" />
                        {t("sessionLink")}
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </ScrollableItemList>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-body font-semibold text-heading">
              {t("bookingsHistory")}
            </h2>
            <ListScrollHint count={data?.past.length ?? 0} />
          </div>
          {!data || data.past.length === 0 ? (
            <Card>
              <p className="text-text/70 text-center py-4">
                {t("bookingsHistoryEmpty")}
              </p>
            </Card>
          ) : (
            <ScrollableItemList
              count={data.past.length}
              maxHeightClassName="max-h-96 sm:max-h-[28rem]"
            >
              {data.past.map((booking) => {
                const canReview =
                  !booking.review && isBookingReviewable(booking, now);

                return (
                  <Card key={booking.id} className="opacity-80">
                    <h3 className="font-semibold text-heading">
                      {booking.service.title}
                    </h3>
                    <p className="text-sm text-text/70">
                      {format(booking.date, "d MMMM yyyy", {
                        locale: dateLocale,
                      })}{" "}
                      {t("bookingAtTime", { time: booking.startTime })}
                    </p>
                    {booking.review ? (
                      <SessionReviewDisplay review={booking.review} />
                    ) : canReview ? (
                      <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-4">
                        <p className="mb-3 text-sm font-semibold text-heading">
                          {t("sessionReview.pendingTitle")}
                        </p>
                        <SessionReviewForm
                          bookingId={booking.id}
                          serviceTitle={booking.service.title}
                          sessionDate={booking.date}
                          startTime={booking.startTime}
                          compact
                        />
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </ScrollableItemList>
          )}
        </section>
      </div>
    </div>
  );
}
