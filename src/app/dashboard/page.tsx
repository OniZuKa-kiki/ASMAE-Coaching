import { Calendar, BookOpen, Target, CreditCard, Video } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

import { ButtonLink } from "@/components/ui/button";

import { getDashboardData } from "@/lib/dashboard";

import { format } from "date-fns";

import { dateFnsLocale } from "@/lib/locale";



export const dynamic = "force-dynamic";



export default async function DashboardPage() {

  const data = await getDashboardData();



  if (!data) {

    return <p>جارٍ التحميل...</p>;

  }



  const { stats, upcomingBookings } = data;



  return (

    <div>

      <h1 className="page-header-title mb-2">

        مرحباً{data.user.firstName ? `، ${data.user.firstName}` : ""}

      </h1>

      <p className="text-text/70 mb-10">

        اعثر على استشاراتك ودوراتك ومواردك في مكان واحد.

      </p>



      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {[

          { label: "الجلسات القادمة", value: stats.upcoming, icon: Calendar },

          { label: "الدورات النشطة", value: stats.enrollments, icon: BookOpen },

          { label: "الأهداف الجارية", value: stats.goals, icon: Target },

          { label: "المدفوعات", value: stats.payments, icon: CreditCard },

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

          <CardTitle className="mb-3">لا توجد استشارات قادمة</CardTitle>

          <p className="text-text/70 mb-6">

            احجز جلستك القادمة لبدء رحلتك.

          </p>

          <ButtonLink href="/booking">حجز جلسة</ButtonLink>

        </Card>

      ) : (

        <div className="space-y-4">

          <h2 className="font-heading text-xl font-semibold text-heading">

            الجلسات القادمة

          </h2>

          {upcomingBookings.map((booking) => (

            <Card key={booking.id}>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div>

                  <h3 className="font-semibold text-heading">

                    {booking.service.title}

                  </h3>

                  <p className="text-sm text-text/70">

                    {format(booking.date, "EEEE d MMMM yyyy", { locale: dateFnsLocale })} في {booking.startTime}

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

                    الانضمام إلى الاجتماع المرئي

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

