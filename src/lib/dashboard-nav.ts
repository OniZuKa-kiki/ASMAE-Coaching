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
  type LucideIcon,
} from "lucide-react";

export type PanelNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavLinks: PanelNavLink[] = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "الاستشارات", icon: Calendar },
  { href: "/dashboard/courses", label: "دوراتي", icon: BookOpen },
  { href: "/dashboard/podcasts", label: "بودكاست", icon: Headphones },
  { href: "/dashboard/goals", label: "الأهداف", icon: Target },
  { href: "/dashboard/journal", label: "اليوميات", icon: PenLine },
  { href: "/dashboard/resources", label: "الموارد", icon: FileText },
  { href: "/dashboard/payments", label: "المدفوعات", icon: CreditCard },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
];
