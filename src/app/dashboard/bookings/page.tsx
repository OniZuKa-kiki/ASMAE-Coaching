import { format } from "date-fns";
import { Video } from "lucide-react";
import { BookingsCalendar } from "@/components/dashboard/bookings-calendar";
import { SessionReviewDisplay } from "@/components/dashboard/session-review-display";
import { SessionReviewForm } from "@/components/dashboard/session-review-form";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { dashboardContent } from "@/lib/constants";
import { getUserBookingsPageData } from "@/lib/dashboard";
import { isBookingReviewable } from "@/lib/session-review";
import { dateFnsLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function DashboardBookingsPage() {
  const data = await getUserBookingsPageData();
  const now = new Date();

  return (
    <div>
      <h1 className="page-header-title mb-2">{dashboardContent.bookingsTitle}</h1>
      <p className="text-text/70 mb-6">{dashboardContent.bookingsCalendarLabel}</p>

      <BookingsCalendar bookings={data?.calendarItems ?? []} />

      <div className="space-y-6">
        <section>
          <h2 className="font-body font-semibold text-heading mb-4">
            {dashboardContent.bookingsUpcoming}
          </h2>
          {!data || data.upcoming.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text/70 mb-4">
                {dashboardContent.noScheduledSessions}
              </p>
              <ButtonLink href="/booking">{dashboardContent.bookSession}</ButtonLink>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.upcoming.map((booking) => (
                <Card key={booking.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-heading">
                        {booking.service.title}
                      </h3>
                      <p className="text-sm text-text/70">
                        {format(booking.date, "EEEE d MMMM yyyy", {
                          locale: dateFnsLocale,
                        })}{" "}
                        في {booking.startTime}
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
                        {dashboardContent.sessionLink}
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-body font-semibold text-heading mb-4">
            {dashboardContent.bookingsHistory}
          </h2>
          {!data || data.past.length === 0 ? (
            <Card>
              <p className="text-text/70 text-center py-4">
                {dashboardContent.bookingsHistoryEmpty}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
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
                      locale: dateFnsLocale,
                    })}{" "}
                    في {booking.startTime}
                  </p>
                  {booking.review ? (
                    <SessionReviewDisplay review={booking.review} />
                  ) : canReview ? (
                    <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-4">
                      <p className="mb-3 text-sm font-semibold text-heading">
                        {dashboardContent.sessionReview.pendingTitle}
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
