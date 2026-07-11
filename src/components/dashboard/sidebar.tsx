"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { dashboardNavLinks } from "@/lib/dashboard-nav";

export function DashboardSidebar({
  unreadNotifications = 0,
}: {
  unreadNotifications?: number;
}) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("dashboard.nav");

  const links = dashboardNavLinks.map((link) => ({
    ...link,
    label: tNav(link.labelKey!),
  }));

  return (
    <aside className="hidden lg:block fixed top-0 inset-inline-end-0 z-30 w-64 h-dvh overflow-y-auto shrink-0 bg-card border-e border-border/60 shadow-[-8px_0_24px_rgba(0,0,0,0.04)] p-6">
      <h2 className="font-heading text-xl font-semibold text-heading mb-4">
        {t("spaceTitle")}
      </h2>
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-medium text-text border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
      >
        <Home className="w-5 h-5" />
        {t("backToSite")}
      </Link>
      <PanelNavList
        links={links}
        variant="dashboard"
        badgeByHref={
          unreadNotifications > 0
            ? { "/dashboard/notifications": unreadNotifications }
            : undefined
        }
      />
    </aside>
  );
}
