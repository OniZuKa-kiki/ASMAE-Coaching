import "server-only";

import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { isAppLocale } from "@/lib/user-locale";

export type InvoiceCopy = {
  documentTitle: string;
  pageTitle: string;
  sampleBadge: string;
  downloadPdf: string;
  tagline: string;
  invoiceNumberLabel: string;
  billTo: string;
  invoiceInfo: string;
  name: string;
  email: string;
  issuedAt: string;
  status: string;
  paymentMethod: string;
  serviceDetails: string;
  description: string;
  amount: string;
  subtotal: string;
  totalPaid: string;
  thanks: string;
  legal: string;
  fallbackClient: string;
  fallbackDescription: string;
  statuses: Record<string, string>;
  sample: {
    clientName: string;
    description: string;
  };
};

type InvoiceMessages = {
  invoice: InvoiceCopy;
};

export async function resolveInvoiceLocale(
  preferredLocale?: string | null
): Promise<AppLocale> {
  if (isAppLocale(preferredLocale)) return preferredLocale;
  const locale = await getLocale();
  return isAppLocale(locale) ? locale : "ar";
}

export async function getInvoiceCopy(locale: AppLocale): Promise<InvoiceCopy> {
  const messages = (await import(`../../messages/${locale}.json`))
    .default as InvoiceMessages;
  return messages.invoice;
}

export function getInvoiceStatusLabel(
  copy: InvoiceCopy,
  status: string
): string {
  return copy.statuses[status] ?? status;
}
