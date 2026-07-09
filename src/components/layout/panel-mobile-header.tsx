"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Home, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { PanelNavList } from "@/components/layout/panel-nav-list";
import { getAdminNavLinks } from "@/lib/admin-nav";
import { dashboardNavLinks } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type PanelMobileHeaderProps = {
  variant: "dashboard" | "admin";
  homeLabel?: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export function PanelMobileHeader({
  variant,
  homeLabel,
}: PanelMobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = variant === "admin";
  const links = isAdmin ? getAdminNavLinks() : dashboardNavLinks;
  const label = homeLabel ?? (isAdmin ? "عرض الموقع" : "الرئيسية");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 text-heading rounded-lg hover:bg-primary/5 transition-colors"
            aria-label={isAdmin ? "فتح القائمة" : "فتح القائمة"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center min-w-0 px-1">
          <Logo
            size="header"
            className="scale-[0.82] sm:scale-[0.85] origin-center max-w-[100px] sm:max-w-[120px] mx-auto"
          />
        </div>

        <div className="flex justify-end">
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
            className="lg:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-heading/40"
              onClick={() => setOpen(false)}
              aria-label={isAdmin ? "Fermer le menu" : "إغلاق القائمة"}
            />

            <motion.aside
              className={cn(
                "absolute top-0 left-0 h-full w-[min(100vw-3rem,20rem)] shadow-soft flex flex-col",
                isAdmin ? "bg-heading text-white" : "bg-card border-r border-border/50"
              )}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
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
                    {isAdmin ? "Administration" : "مساحتي"}
                  </p>
                  {isAdmin && (
                    <p className="text-white/50 text-xs mt-0.5">ASMAE Coaching</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isAdmin ? "text-white hover:bg-white/10" : "text-heading hover:bg-primary/5"
                  )}
                  aria-label={isAdmin ? "Fermer le menu" : "إغلاق القائمة"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
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
                  {isAdmin ? "Ouvrir le site" : "العودة للموقع"}
                </Link>

                <PanelNavList
                  links={links}
                  variant={variant}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
