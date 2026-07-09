"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminUrl } from "@/lib/admin-path";
import { cn } from "@/lib/utils";
import type { PanelNavLink } from "@/lib/dashboard-nav";

type PanelNavListProps = {
  links: PanelNavLink[];
  variant: "dashboard" | "admin";
  onNavigate?: () => void;
};

export function PanelNavList({
  links,
  variant,
  onNavigate,
}: PanelNavListProps) {
  const currentPath = usePathname();
  const isAdmin = variant === "admin";

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive =
          currentPath === link.href ||
          (link.href !== "/dashboard" &&
            link.href !== adminUrl() &&
            currentPath.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200",
              isAdmin
                ? isActive
                  ? "bg-white text-heading"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                : isActive
                ? "bg-primary/10 text-primary"
                : "text-text hover:bg-primary/5 hover:text-primary"
            )}
          >
            <link.icon className="w-5 h-5 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
