"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { isNavLinkActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

const MORE_NAV_KEY = "__more__";

const primaryNav = [
  { href: "/", key: "home" },
  { href: "/services", key: "coaching" },
  { href: "/courses", key: "courses" },
  { href: "/contact", key: "contact" },
] as const;

const moreNav = [
  { href: "/about", key: "about" },
  { href: "/booking", key: "bookSession" },
  { href: "/podcasts", key: "podcasts" },
  { href: "/blog", key: "blog" },
  { href: "/testimonials", key: "testimonials" },
] as const;

const underlineTransition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.75,
} as const;

type DesktopNavItemProps = {
  navKey: string;
  href: string;
  children: ReactNode;
  indicatorKey: string | null;
  isActive: boolean;
  onHover: (key: string) => void;
  onClick?: () => void;
};

function DesktopNavItem({
  navKey,
  href,
  children,
  indicatorKey,
  isActive,
  onHover,
  onClick,
}: DesktopNavItemProps) {
  const highlighted = indicatorKey === navKey;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onMouseEnter={() => onHover(navKey)}
      onClick={onClick}
      className={cn(
        "relative py-1 text-sm font-medium whitespace-nowrap transition-colors duration-200",
        isActive || highlighted
          ? "text-primary"
          : "text-text hover:text-primary",
        isActive && "font-semibold"
      )}
    >
      {children}
      {highlighted && (
        <motion.span
          layoutId="desktop-nav-underline"
          className="absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-primary"
          transition={underlineTransition}
        />
      )}
    </Link>
  );
}

export function DesktopNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreActive = moreNav.some((item) => isNavLinkActive(pathname, item.href));

  const activeKey =
    primaryNav.find((item) => isNavLinkActive(pathname, item.href))?.href ??
    (moreActive ? MORE_NAV_KEY : null);

  const indicatorKey = hoveredKey ?? activeKey;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="flex items-center gap-6"
      onMouseLeave={() => setHoveredKey(null)}
    >
      {primaryNav.map((item) => (
        <DesktopNavItem
          key={item.href}
          navKey={item.href}
          href={item.href}
          indicatorKey={indicatorKey}
          isActive={isNavLinkActive(pathname, item.href)}
          onHover={setHoveredKey}
        >
          {t(item.key)}
        </DesktopNavItem>
      ))}

      <div ref={moreRef} className="relative">
        <button
          type="button"
          onMouseEnter={() => setHoveredKey(MORE_NAV_KEY)}
          onClick={() => setMoreOpen((open) => !open)}
          className={cn(
            "relative flex items-center gap-1 py-1 text-sm font-medium transition-colors duration-200",
            moreActive || indicatorKey === MORE_NAV_KEY
              ? "text-primary"
              : "text-text hover:text-primary",
            moreActive && "font-semibold"
          )}
          aria-expanded={moreOpen}
          aria-haspopup="true"
          aria-current={moreActive ? "page" : undefined}
        >
          {t("more")}
          <ChevronDown
            className={cn("w-4 h-4 transition-transform duration-200", moreOpen && "rotate-180")}
          />
          {indicatorKey === MORE_NAV_KEY && (
            <motion.span
              layoutId="desktop-nav-underline"
              className="absolute -bottom-1 inset-x-0 h-0.5 rounded-full bg-primary"
              transition={underlineTransition}
            />
          )}
        </button>

        {moreOpen && (
          <div className="absolute top-full start-0 mt-2 w-48 rounded-[16px] bg-card border border-border/50 shadow-soft py-2 z-50">
            {moreNav.map((item) => {
              const active = isNavLinkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block px-4 py-2.5 text-sm transition-colors",
                    active
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-text hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setMoreOpen(false)}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
