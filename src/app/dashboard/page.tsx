import { Calendar, BookOpen, Target, CreditCard, Video } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { MoodCheckInCard } from "@/components/dashboard/mood-check-in-card";
import { SessionReviewPrompt } from "@/components/dashboard/session-review-prompt";
import { dashboardContent } from "@/lib/constants";
import { getDashboardData } from "@/lib/dashboard";
import { getPendingSessionReview } from "@/lib/session-review";
import { getOrCreateUser } from "@/lib/user";
import { format } from "date-fns";
import { dateFnsLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  const [data, pendingReview] = await Promise.all([
    getDashboardData(),
    user ? getPendingSessionReview(user.id) : Promise.resolve(null),
  ]);

  if (!data) {
    return <p>جارٍ التحميل...</p>;
  }

  const { stats, upcomingBookings } = data;

  return (
    <div>
      <h1 className="page-header-title mb-2">
        {dashboardContent.welcome(data.user.firstName)}
      </h1>
      <p className="text-text/70 mb-6">{dashboardContent.overviewSubtitle}</p>

      <MoodCheckInCard />

      {pendingReview ? <SessionReviewPrompt booking={pendingReview} /> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: dashboardContent.stats.upcomingSessions,
            value: stats.upcoming,
            icon: Calendar,
          },
          {
            label: dashboardContent.stats.activeCourses,
            value: stats.enrollments,
            icon: BookOpen,
          },
          {
            label: dashboardContent.stats.currentGoals,
            value: stats.goals,
            icon: Target,
          },
          {
            label: dashboardContent.stats.payments,
            value: stats.payments,
            icon: CreditCard,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-heading">{stat.value}</p>
                <p className="text-sm text-text/70">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {upcomingBookings.length === 0 ? (
        <Card className="text-center py-12">
          <CardTitle className="mb-3">
            {dashboardContent.noUpcomingSessions}
          </CardTitle>
          <p className="text-text/70 mb-6">{dashboardContent.bookNextSession}</p>
          <ButtonLink href="/booking">{dashboardContent.bookSession}</ButtonLink>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-heading">
            {dashboardContent.upcomingSessionsTitle}
          </h2>
          {upcomingBookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    <Video className="w-4 h-4" />
                    {dashboardContent.joinSession}
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
