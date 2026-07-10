import { Suspense } from "react";
import { Users, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { AdminTodayOverview } from "@/components/admin/today-overview";
import { PanelPageSkeleton } from "@/components/ui/panel-page-skeleton";
import {
  getAdminDashboardStats,
  getAdminTodayOverview,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

async function AdminDashboardContent() {
  const [data, today] = await Promise.all([
    getAdminDashboardStats(),
    getAdminTodayOverview(),
  ]);

  const stats = [
    {
      label: "العملاء",
      value: String(data.clients.value),
      icon: Users,
      change: data.clients.change,
    },
    {
      label: "حجوزات هذا الشهر",
      value: String(data.bookingsThisMonth.value),
      icon: Calendar,
      change: data.bookingsThisMonth.change,
    },
    {
      label: "إيرادات هذا الشهر",
      value: data.revenueThisMonth.value,
      icon: CreditCard,
      change: data.revenueThisMonth.change,
    },
    {
      label: "معدل التحويل",
      value: data.conversionRate.value,
      icon: TrendingUp,
      change: data.conversionRate.change,
    },
  ];

  return (
    <>
      <AdminTodayOverview data={today} />
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="mb-3 flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-primary">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-semibold text-heading">{stat.value}</p>
            <p className="text-sm text-text/70">{stat.label}</p>
          </Card>
        ))}
      </div>
      {!data.hasActivity ? (
        <Card className="py-12 text-center">
          <CardTitle className="mb-3">لا تتوفر إحصاءات بعد.</CardTitle>
          <p className="text-text/70">
            ستظهر الإحصاءات التفصيلية تلقائيًا بمجرد بدء استخدام المنصة (تسجيل
            العملاء، الحجوزات والمدفوعات).
          </p>
        </Card>
      ) : null}
    </>
  );
}

export default function AdminPage() {
  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">لوحة التحكم</h1>
      <Suspense
        fallback={
          <PanelPageSkeleton variant="stats" showFilters={false} rows={0} />
        }
      >
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}
