import { format } from "date-fns";
import { Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getUserBookings } from "@/lib/dashboard";
import { dateFnsLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function DashboardBookingsPage() {
  const data = await getUserBookings();

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        استشاراتي
      </h1>
      <div className="space-y-6">
        <section>
          <h2 className="font-body font-semibold text-heading mb-4">القادمة</h2>
          {!data || data.upcoming.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text/70 mb-4">لا توجد جلسات مجدولة</p>
              <ButtonLink href="/booking">حجز جلسة</ButtonLink>
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
                        {format(booking.date, "EEEE d MMMM yyyy", { locale: dateFnsLocale })}{" "}
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
                        رابط الاجتماع المرئي
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-body font-semibold text-heading mb-4">السجل</h2>
          {!data || data.past.length === 0 ? (
            <Card>
              <p className="text-text/70 text-center py-4">
                سيظهر سجلك هنا بعد جلساتك الأولى.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.past.map((booking) => (
                <Card key={booking.id} className="opacity-80">
                  <h3 className="font-semibold text-heading">
                    {booking.service.title}
                  </h3>
                  <p className="text-sm text-text/70">
                    {format(booking.date, "d MMMM yyyy", { locale: dateFnsLocale })} في{" "}
                    {booking.startTime}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
