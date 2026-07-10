import {
  Calendar,
  BookOpen,
  CreditCard,
  FileText,
  Target,
  Headphones,
  Settings,
  LayoutDashboard,
  PenLine,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type PanelNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavLinks: PanelNavLink[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
  { href: "/dashboard/bookings", label: "جلساتي", icon: Calendar },
  { href: "/dashboard/courses", label: "دوراتي", icon: BookOpen },
  { href: "/dashboard/podcasts", label: "البودكاست", icon: Headphones },
  { href: "/dashboard/goals", label: "أهدافي", icon: Target },
  { href: "/dashboard/journal", label: "يومياتي", icon: PenLine },
  { href: "/dashboard/resources", label: "مكتبتي", icon: FileText },
  { href: "/dashboard/payments", label: "المدفوعات", icon: CreditCard },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];
