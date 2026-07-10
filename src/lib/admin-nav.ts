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
  type LucideIcon,
} from "lucide-react";
import { adminUrl } from "@/lib/admin-path";

export type PanelNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getAdminNavLinks(): PanelNavLink[] {
  return [
    { href: adminUrl(), label: "لوحة التحكم", icon: BarChart3 },
    { href: adminUrl("/users"), label: "العملاء", icon: Users },
    { href: adminUrl("/bookings"), label: "الحجوزات", icon: Calendar },
    { href: adminUrl("/courses"), label: "الدورات", icon: BookOpen },
    { href: adminUrl("/podcasts"), label: "البودكاست", icon: Headphones },
    { href: adminUrl("/blog"), label: "المدونة", icon: FileText },
    { href: adminUrl("/payments"), label: "الفواتير", icon: CreditCard },
    { href: adminUrl("/coupons"), label: "القسائم", icon: Tag },
    { href: adminUrl("/settings"), label: "الإعدادات", icon: Settings },
  ];
}

/** @deprecated Utiliser getAdminNavLinks() */
export const adminNavLinks = getAdminNavLinks();
