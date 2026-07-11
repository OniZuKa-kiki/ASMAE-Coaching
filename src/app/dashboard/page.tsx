import type { Metadata } from "next";
import { Calendar, BookOpen, Target, CreditCard, Video, Route } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { MoodCheckInCard } from "@/components/dashboard/mood-check-in-card";
import { ContentRecommendations } from "@/components/dashboard/content-recommendations";
import { SessionReviewPrompt } from "@/components/dashboard/session-review-prompt";
import { getDashboardData } from "@/lib/dashboard";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getPendingSessionReview } from "@/lib/session-review";
import { getOrCreateUser } from "@/lib/user";
import { format } from "date-fns";
import { dateFnsLocaleFor } from "@/lib/locale";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard",
    namespace: "dashboard",
    titleKey: "spaceTitle",
    descriptionKey: "overviewSubtitle",
  });
}

export default async function DashboardPage() {
  const [user, locale, t, tCommon] = await Promise.all([
    getOrCreateUser(),
    getLocale() as Promise<AppLocale>,
    getTranslations("dashboard"),
    getTranslations("common"),
  ]);

  const [data, pendingReview] = await Promise.all([
    getDashboardData(),
    user ? getPendingSessionReview(user.id) : Promise.resolve(null),
  ]);

  if (!data) {
    return <p>{tCommon("loading")}</p>;
  }

  const { stats, upcomingBookings } = data;
  const dateLocale = dateFnsLocaleFor(locale);
  const welcome = data.user.firstName
    ? t("welcomeWithName", { name: data.user.firstName })
    : t("welcome");

  return (
    <div>
      <PanelPageHeader title={welcome} subtitle={t("overviewSubtitle")} />

      <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-heading mb-1">
              {t("journey.title")}
            </h2>
            <p className="text-sm text-text/70">{t("journey.subtitle")}</p>
          </div>
          <ButtonLink href="/dashboard/journey" variant="secondary" className="shrink-0">
            <Route className="h-4 w-4" />
            {t("journey.title")}
          </ButtonLink>
        </div>
      </Card>

      <MoodCheckInCard />

      <ContentRecommendations />

      {pendingReview ? <SessionReviewPrompt booking={pendingReview} /> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: t("stats.upcomingSessions"),
            value: stats.upcoming,
            icon: Calendar,
          },
          {
            label: t("stats.activeCourses"),
            value: stats.enrollments,
            icon: BookOpen,
          },
          {
            label: t("stats.currentGoals"),
            value: stats.goals,
            icon: Target,
          },
          {
            label: t("stats.payments"),
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
          <CardTitle className="mb-3">{t("noUpcomingSessions")}</CardTitle>
          <p className="text-text/70 mb-6">{t("bookNextSession")}</p>
          <ButtonLink href="/booking">{t("bookSession")}</ButtonLink>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-heading">
            {t("upcomingSessionsTitle")}
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    <Video className="w-4 h-4" />
                    {t("joinSession")}
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
