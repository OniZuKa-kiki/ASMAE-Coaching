"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { adminNavLinks } from "@/lib/admin-nav";

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-heading text-white p-6 hidden lg:block sticky top-0 self-start h-dvh overflow-y-auto shrink-0">
      <h2 className="font-heading text-xl font-semibold mb-2">Administration</h2>
      <p className="text-white/50 text-sm mb-4">ASMAE Coaching</p>
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <ExternalLink className="w-5 h-5" />
        Ouvrir le site
      </Link>
      <PanelNavList links={adminNavLinks} variant="admin" />
    </aside>
  );
}
