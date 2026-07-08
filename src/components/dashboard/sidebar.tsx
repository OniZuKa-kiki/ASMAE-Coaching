"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { dashboardNavLinks } from "@/lib/dashboard-nav";

export function DashboardSidebar() {
  return (
    <aside className="w-64 bg-card border-e border-border/50 p-6 hidden lg:block sticky top-0 self-start h-dvh overflow-y-auto shrink-0">
      <h2 className="font-heading text-xl font-semibold text-heading mb-4">
        مساحتي
      </h2>
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-medium text-text border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
      >
        <Home className="w-5 h-5" />
        العودة للموقع
      </Link>
      <PanelNavList links={dashboardNavLinks} variant="dashboard" />
    </aside>
  );
}
