"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { getAdminNavLinks } from "@/lib/admin-nav";

export function AdminSidebar() {
  const t = useTranslations("admin");
  const tNav = useTranslations("admin.nav");
  const links = getAdminNavLinks((key) => tNav(key));

  return (
    <aside className="scrollbar-panel hidden lg:flex lg:flex-col fixed top-0 start-0 z-30 w-64 h-dvh overflow-x-hidden overflow-y-auto bg-heading text-white p-6 border-e border-white/10 shadow-[8px_0_24px_rgba(0,0,0,0.06)]">
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold mb-1">
          {t("sidebarTitle")}
        </h2>
        <p className="text-white/50 text-sm mb-4">{t("spaceSubtitle")}</p>
        <LocaleSwitcher variant="onDark" compact fullWidth />
      </div>
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <ExternalLink className="w-5 h-5" />
        {t("viewSite")}
      </Link>
      <PanelNavList links={links} variant="admin" />
    </aside>
  );
}
