"use client";

import { useTranslations } from "next-intl";

export function AdminListLimitNotice({
  shown,
  limit,
}: {
  shown: number;
  limit: number;
}) {
  const t = useTranslations("adminPages");

  if (shown < limit) return null;

  return (
    <p className="mt-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-sm text-text/70">
      {t("listLimit", { limit })}
    </p>
  );
}
