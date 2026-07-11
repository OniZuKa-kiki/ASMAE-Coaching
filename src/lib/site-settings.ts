import "server-only";

import { siteConfig } from "@/lib/constants";
import {
  getDefaultContact,
  type PublicContact,
} from "@/lib/contact-info";
import { prisma } from "@/lib/db";

export const SITE_SETTINGS_ID = "default";

export type { PublicContact };

function defaultRow() {
  const contact = getDefaultContact();
  return {
    id: SITE_SETTINGS_ID,
    contactEmail: contact.email,
    contactPhone: contact.phone,
    coachEmail: null as string | null,
    whatsappUrl: contact.whatsapp,
    instagramUrl: contact.instagram,
    instagramHandle: contact.instagramHandle,
    localeArEnabled: true,
    localeFrEnabled: false,
    updatedAt: new Date(),
  };
}

export function normalizeWhatsappInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function normalizeInstagramInput(input: string): {
  url: string;
  handle: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return { url: "", handle: "" };

  if (/^https?:\/\//i.test(trimmed)) {
    const handle =
      trimmed
        .replace(/\/$/, "")
        .split("/")
        .pop()
        ?.replace(/^@/, "") ?? "";
    return { url: trimmed, handle };
  }

  const handle = trimmed.replace(/^@/, "");
  return {
    url: `https://instagram.com/${handle}`,
    handle,
  };
}

export async function getSiteSettings() {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: SITE_SETTINGS_ID },
    });
    return row ?? defaultRow();
  } catch {
    return defaultRow();
  }
}

export async function getPublicContact(): Promise<PublicContact> {
  const settings = await getSiteSettings();
  return {
    email: settings.contactEmail,
    phone: settings.contactPhone?.trim() || null,
    whatsapp: settings.whatsappUrl?.trim() || null,
    instagram: settings.instagramUrl?.trim() || null,
    instagramHandle: settings.instagramHandle?.trim() || null,
  };
}

export async function getCoachNotificationEmail(): Promise<string> {
  const settings = await getSiteSettings();
  return (
    settings.coachEmail?.trim() ||
    process.env.COACH_EMAIL?.trim() ||
    settings.contactEmail ||
    siteConfig.contact.email
  );
}

export async function getPublicContactEmail(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.contactEmail || siteConfig.contact.email;
}
