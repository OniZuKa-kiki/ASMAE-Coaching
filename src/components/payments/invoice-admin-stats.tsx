"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import type { InvoiceAdminStats } from "@/lib/invoice-utils";

type InvoiceAdminStatsCardsProps = {
  stats: InvoiceAdminStats;
};

export function InvoiceAdminStatsCards({ stats }: InvoiceAdminStatsCardsProps) {
  const t = useTranslations("adminPages.payments.stats");

  const items = [
    { label: t("total"), value: String(stats.total) },
    { label: t("paid"), value: String(stats.paid) },
    { label: t("refunded"), value: String(stats.refunded) },
    { label: t("pending"), value: String(stats.pending) },
    { label: t("revenue"), value: stats.revenueLabel },
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
