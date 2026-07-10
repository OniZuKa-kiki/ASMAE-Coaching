import Link from "next/link";
import { CreditCard, UserPlus, Wallet } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { adminUrl } from "@/lib/admin-path";
import type { AdminTodayOverview } from "@/lib/admin-stats";
import { cn } from "@/lib/utils";

const bookingStatusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
};

const bookingStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-slate-100 text-slate-700",
};

export function AdminTodayOverview({ data }: { data: AdminTodayOverview }) {
  const metrics = [
    {
      label: "عميلات جديدات (24 ساعة)",
      value: String(data.newClients24h),
      icon: UserPlus,
    },
    {
      label: "مدفوعات اليوم",
      value: String(data.paymentsToday),
      icon: CreditCard,
    },
    {
      label: "إيرادات اليوم",
      value: data.revenueToday,
      icon: Wallet,
    },
  ];

  return (
    <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl sm:text-2xl">اليوم</CardTitle>
          <p className="mt-1 text-sm text-text/70">{data.dateLabel}</p>
        </div>
        <Link
          href={adminUrl("/bookings")}
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          عرض كل الحجوزات ←
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
        <h3 className="mb-4 font-heading text-lg font-semibold text-heading">
          جلسات اليوم ({data.sessions.length})
        </h3>

        {data.sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-text/70">
            لا توجد جلسات مجدولة لهذا اليوم.
          </p>
        ) : (
          <div className="space-y-3">
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
                      {bookingStatusLabels[session.status] ?? session.status}
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
                    <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs text-primary font-medium">
                      {session.moodEmoji ? (
                        <span aria-hidden>{session.moodEmoji}</span>
                      ) : null}
                      <span>مزاج اليوم: {session.moodLabel}</span>
                      {session.moodNote ? (
                        <span className="text-text/60">— {session.moodNote}</span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.moodCheckIns.length > 0 ? (
        <div className="mt-8 border-t border-border/60 pt-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-heading">
            مزاج العميلات اليوم ({data.moodCheckIns.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.moodCheckIns.map((checkIn, index) => (
              <span
                key={`${checkIn.clientName}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-heading"
              >
                {checkIn.moodEmoji ? (
                  <span aria-hidden>{checkIn.moodEmoji}</span>
                ) : null}
                {checkIn.clientName} · {checkIn.moodLabel}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
