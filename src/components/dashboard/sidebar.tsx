"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { dashboardContent } from "@/lib/constants";
import { dashboardNavLinks } from "@/lib/dashboard-nav";

export function DashboardSidebar({
  unreadNotifications = 0,
}: {
  unreadNotifications?: number;
}) {
  return (
    <aside className="hidden lg:block fixed top-0 right-0 z-30 w-64 h-dvh overflow-y-auto shrink-0 bg-card border-e border-border/60 shadow-[-8px_0_24px_rgba(0,0,0,0.04)] p-6">
      <h2 className="font-heading text-xl font-semibold text-heading mb-4">
        {dashboardContent.spaceTitle}
      </h2>
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-medium text-text border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
      >
        <Home className="w-5 h-5" />
        {dashboardContent.backToSite}
      </Link>
      <PanelNavList
        links={dashboardNavLinks}
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
