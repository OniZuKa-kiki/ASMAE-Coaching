"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Home, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Logo } from "@/components/layout/logo";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { getAdminNavLinks } from "@/lib/admin-nav";
import { dashboardNavLinks } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/use-scroll-lock";

type PanelMobileHeaderProps = {
  variant: "dashboard" | "admin";
  homeLabel?: string;
  unreadNotifications?: number;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export function PanelMobileHeader({
  variant,
  homeLabel,
  unreadNotifications = 0,
}: PanelMobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = variant === "admin";
  const tDashboard = useTranslations("dashboard");
  const tNav = useTranslations("dashboard.nav");
  const tAdmin = useTranslations("admin");
  const tAdminNav = useTranslations("admin.nav");
  const tSiteNav = useTranslations("nav");
  const locale = useLocale();
  const menuSlideX = locale === "ar" ? "100%" : "-100%";
  const links = isAdmin
    ? getAdminNavLinks((key) => tAdminNav(key))
    : dashboardNavLinks.map((link) => ({
        ...link,
        label: tNav(link.labelKey!),
      }));
  const label = homeLabel ?? (isAdmin ? tAdmin("viewSite") : tDashboard("backToSite"));
  const openMenuLabel = isAdmin ? tSiteNav("openMenu") : tSiteNav("openMenu");
  const closeMenuLabel = isAdmin ? tSiteNav("closeMenu") : tSiteNav("closeMenu");

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-border/50 bg-card/95 backdrop-blur-md px-4 py-3"
        suppressHydrationWarning
      >
        <div className="flex justify-start" suppressHydrationWarning>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 text-heading rounded-lg hover:bg-primary/5 transition-colors"
            aria-label={openMenuLabel}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center min-w-0 px-1" suppressHydrationWarning>
          <Logo
            size="header"
            className="scale-[0.82] sm:scale-[0.85] origin-center max-w-[100px] sm:max-w-[120px] mx-auto"
          />
        </div>

        <div className="flex justify-end" suppressHydrationWarning>
          <Link
            href="/"
            target={isAdmin ? "_blank" : undefined}
            rel={isAdmin ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-2 text-xs sm:text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            {isAdmin ? (
              <ExternalLink className="w-4 h-4 shrink-0" />
            ) : (
              <Home className="w-4 h-4 shrink-0" />
            )}
            <span className="max-[360px]:hidden">{label}</span>
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel-menu"
            className="lg:hidden fixed inset-0 z-50 h-dvh max-h-dvh overflow-hidden touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-heading/40"
              onClick={() => setOpen(false)}
              aria-label={closeMenuLabel}
            />

            <motion.aside
              className={cn(
                "absolute top-0 inset-inline-start-0 h-dvh max-h-dvh w-[min(100vw-3rem,20rem)] shadow-soft flex flex-col overflow-hidden touch-auto pb-[env(safe-area-inset-bottom)]",
                isAdmin ? "bg-heading text-white" : "bg-card border-e border-border/50"
              )}
              initial={{ x: menuSlideX }}
              animate={{ x: 0 }}
              exit={{ x: menuSlideX }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-4 border-b",
                  isAdmin ? "border-white/10" : "border-border/50"
                )}
              >
                <div>
                  <p
                    className={cn(
                      "font-heading text-lg font-semibold",
                      isAdmin ? "text-white" : "text-heading"
                    )}
                  >
                    {isAdmin ? tAdmin("spaceTitle") : tDashboard("spaceTitle")}
                  </p>
                  {isAdmin && (
                    <p className="text-white/50 text-xs mt-0.5">{tAdmin("spaceSubtitle")}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isAdmin ? "text-white hover:bg-white/10" : "text-heading hover:bg-primary/5"
                  )}
                  aria-label={closeMenuLabel}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4">
                <div
                  className={cn(
                    "mb-4 pb-4 border-b",
                    isAdmin ? "border-white/10" : "border-border/40"
                  )}
                >
                  <LocaleSwitcher
                    variant={isAdmin ? "onDark" : "default"}
                    compact={isAdmin}
                    fullWidth
                  />
                </div>
                <Link
                  href="/"
                  target={isAdmin ? "_blank" : undefined}
                  rel={isAdmin ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-sm font-medium transition-colors",
                    isAdmin
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "text-text border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  {isAdmin ? (
                    <ExternalLink className="w-5 h-5" />
                  ) : (
                    <Home className="w-5 h-5" />
                  )}
                  {isAdmin ? tAdmin("viewSite") : tDashboard("backToSite")}
                </Link>

                <PanelNavList
                  links={links}
                  variant={variant}
                  onNavigate={() => setOpen(false)}
                  badgeByHref={
                    !isAdmin && unreadNotifications > 0
                      ? { "/dashboard/notifications": unreadNotifications }
                      : undefined
                  }
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
