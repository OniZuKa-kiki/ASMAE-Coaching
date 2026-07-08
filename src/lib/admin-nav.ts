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

export type PanelNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNavLinks: PanelNavLink[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: BarChart3 },
  { href: "/admin/users", label: "Clients", icon: Users },
  { href: "/admin/bookings", label: "Réservations", icon: Calendar },
  { href: "/admin/courses", label: "Formations", icon: BookOpen },
  { href: "/admin/podcasts", label: "Podcasts", icon: Headphones },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/payments", label: "Paiements", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];
