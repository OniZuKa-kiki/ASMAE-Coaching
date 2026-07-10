import { Card } from "@/components/ui/card";
import type { InvoiceAdminStats } from "@/lib/invoice-utils";

type InvoiceAdminStatsCardsProps = {
  stats: InvoiceAdminStats;
};

export function InvoiceAdminStatsCards({ stats }: InvoiceAdminStatsCardsProps) {
  const items = [
    { label: "إجمالي السجلات", value: String(stats.total) },
    { label: "مدفوعة", value: String(stats.paid) },
    { label: "مستردة", value: String(stats.refunded) },
    { label: "قيد الانتظار", value: String(stats.pending) },
    { label: "إيرادات مؤكدة", value: stats.revenueLabel },
  ];

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="px-4 py-3">
          <p className="text-xs text-text/60">{item.label}</p>
          <p className="mt-1 font-heading text-lg font-semibold text-heading">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
