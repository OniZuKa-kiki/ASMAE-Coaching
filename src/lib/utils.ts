import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { siteLocale } from "@/lib/locale";

export function formatPrice(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat(siteLocale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(siteLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const userRoleLabels: Record<string, string> = {
  ADMIN: "مدير النظام",
  COACH: "المدربة",
  CLIENT: "العميلة",
};

export function formatUserRole(role: string): string {
  return userRoleLabels[role] ?? role;
}
