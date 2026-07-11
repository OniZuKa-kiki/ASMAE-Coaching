"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { adminFilterSubmitClassName } from "@/lib/admin-filters";

type AdminFilterCardProps = {
  title: string;
  formClassName?: string;
  children: React.ReactNode;
};

export function AdminFilterCard({
  title,
  formClassName = "grid md:grid-cols-4 gap-4",
  children,
}: AdminFilterCardProps) {
  const t = useTranslations("adminPages.filters");

  return (
    <Card className="mb-6">
      <h2 className="mb-4 font-heading text-xl text-heading">{title}</h2>
      <form method="GET" className={formClassName}>
        {children}
        <div className="flex items-end" suppressHydrationWarning>
          <button type="submit" className={adminFilterSubmitClassName}>
            {t("submit")}
          </button>
        </div>
      </form>
    </Card>
  );
}
