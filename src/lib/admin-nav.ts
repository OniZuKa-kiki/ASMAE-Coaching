import {
  Users,
  Calendar,
  BookOpen,
  Headphones,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Tag,
  Star,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { adminUrl } from "@/lib/admin-path";
import type { PanelNavLink } from "@/lib/dashboard-nav";

export type AdminNavLinkDef = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export function getAdminNavLinkDefs(): AdminNavLinkDef[] {
  return [
    { href: adminUrl(), labelKey: "dashboard", icon: BarChart3 },
    { href: adminUrl("/users"), labelKey: "users", icon: Users },
    { href: adminUrl("/bookings"), labelKey: "bookings", icon: Calendar },
    { href: adminUrl("/services"), labelKey: "services", icon: Briefcase },
    { href: adminUrl("/courses"), labelKey: "courses", icon: BookOpen },
    { href: adminUrl("/podcasts"), labelKey: "podcasts", icon: Headphones },
    { href: adminUrl("/blog"), labelKey: "blog", icon: FileText },
    { href: adminUrl("/testimonials"), labelKey: "testimonials", icon: Star },
    { href: adminUrl("/payments"), labelKey: "payments", icon: CreditCard },
    { href: adminUrl("/coupons"), labelKey: "coupons", icon: Tag },
    { href: adminUrl("/settings"), labelKey: "settings", icon: Settings },
  ];
}

export function getAdminNavLinks(
  labelForKey: (key: string) => string
): PanelNavLink[] {
  return getAdminNavLinkDefs().map((link) => ({
    href: link.href,
    label: labelForKey(link.labelKey),
    icon: link.icon,
  }));
}
