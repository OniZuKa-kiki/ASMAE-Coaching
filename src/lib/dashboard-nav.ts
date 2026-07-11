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
  Heart,
  Search,
  Route,
  type LucideIcon,
} from "lucide-react";

export type PanelNavLink = {
  href: string;
  label?: string;
  labelKey?: string;
  icon: LucideIcon;
};

export const dashboardNavLinks: PanelNavLink[] = [
  { href: "/dashboard", labelKey: "home", icon: LayoutDashboard },
  { href: "/dashboard/journey", labelKey: "journey", icon: Route },
  { href: "/dashboard/notifications", labelKey: "notifications", icon: Bell },
  { href: "/dashboard/favorites", labelKey: "favorites", icon: Heart },
  { href: "/dashboard/search", labelKey: "search", icon: Search },
  { href: "/dashboard/bookings", labelKey: "bookings", icon: Calendar },
  { href: "/dashboard/courses", labelKey: "courses", icon: BookOpen },
  { href: "/dashboard/podcasts", labelKey: "podcasts", icon: Headphones },
  { href: "/dashboard/goals", labelKey: "goals", icon: Target },
  { href: "/dashboard/journal", labelKey: "journal", icon: PenLine },
  { href: "/dashboard/resources", labelKey: "resources", icon: FileText },
  { href: "/dashboard/payments", labelKey: "payments", icon: CreditCard },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
];
