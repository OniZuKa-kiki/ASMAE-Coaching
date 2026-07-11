import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getOrCreateUser } from "@/lib/user";
import { buildInvoiceNumber } from "@/lib/invoice-utils";
import {
  generateInvoiceHtml,
  type InvoicePayload,
} from "@/lib/invoice-html";
import {
  getInvoiceCopy,
  getInvoiceStatusLabel,
  resolveInvoiceLocale,
} from "@/lib/invoice-i18n";
import { getPublicContact } from "@/lib/site-settings";
import { renderInvoicePdfFromHtml } from "@/lib/invoice-pdf";

type InvoiceAccessError = "unauthorized" | "forbidden" | "not_found" | "not_paid";

export type InvoiceHtmlResult =
  | { error: InvoiceAccessError }
  | { html: string; filename: string };

const paymentInclude = {
  user: true,
  booking: { include: { service: true } },
  course: true,
} satisfies Prisma.PaymentInclude;

type PaymentForInvoice = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude;
}>;

export async function getAuthorizedPaymentForInvoice(
  paymentId: string
): Promise<
  { error: InvoiceAccessError } | { payment: PaymentForInvoice }
> {
  const user = await getOrCreateUser();
  if (!user) return { error: "unauthorized" };

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) return { error: "not_found" };

  const admin = await isAdmin();
  if (!admin && payment.userId !== user.id) {
    return { error: "forbidden" };
  }

  if (payment.status !== "PAID") {
    return { error: "not_paid" };
  }

  return { payment };
}

function buildPayloadFromPayment(
  payment: PaymentForInvoice,
  sellerEmail: string,
  copy: Awaited<ReturnType<typeof getInvoiceCopy>>
): InvoicePayload {
  const clientName =
    [payment.user.firstName, payment.user.lastName].filter(Boolean).join(" ") ||
    copy.fallbackClient;

  return {
    invoiceNumber: buildInvoiceNumber(payment.id, payment.createdAt),
    issuedAt: payment.createdAt,
    clientName,
    clientEmail: payment.user.email,
    description:
      payment.booking?.service.title ||
      payment.course?.title ||
      copy.fallbackDescription,
    amountCents: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    status: payment.status,
    statusLabel: getInvoiceStatusLabel(copy, payment.status),
    sellerEmail,
  };
}

export type InvoicePdfResult =
  | { error: InvoiceAccessError }
  | { pdfBytes: Uint8Array; filename: string };

export async function buildInvoiceHtmlForPayment(
  paymentId: string
): Promise<InvoiceHtmlResult> {
  const access = await getAuthorizedPaymentForInvoice(paymentId);
  if ("error" in access) {
    return { error: access.error };
  }

  const locale = await resolveInvoiceLocale(access.payment.user.preferredLocale);
  const [contact, copy] = await Promise.all([
    getPublicContact(),
    getInvoiceCopy(locale),
  ]);
  const payload = buildPayloadFromPayment(access.payment, contact.email, copy);
  const html = generateInvoiceHtml(payload, copy, locale, {
    downloadUrl: `/api/payments/${paymentId}/invoice?download=1`,
  });
  const filename = `invoice-${payload.invoiceNumber}.html`;

  return { html, filename };
}

export async function buildInvoicePdfForPayment(
  paymentId: string
): Promise<InvoicePdfResult> {
  const access = await getAuthorizedPaymentForInvoice(paymentId);
  if ("error" in access) {
    return { error: access.error };
  }

  const locale = await resolveInvoiceLocale(access.payment.user.preferredLocale);
  const [contact, copy] = await Promise.all([
    getPublicContact(),
    getInvoiceCopy(locale),
  ]);
  const payload = buildPayloadFromPayment(access.payment, contact.email, copy);
  const html = generateInvoiceHtml(payload, copy, locale, {
    showToolbar: false,
    forPdf: true,
  });
  const pdfBytes = await renderInvoicePdfFromHtml(html);
  const filename = `invoice-${payload.invoiceNumber}.pdf`;

  return { pdfBytes, filename };
}

export async function buildSampleInvoiceHtml(): Promise<{
  html: string;
  filename: string;
}> {
  const locale = await resolveInvoiceLocale();
  const [contact, copy] = await Promise.all([
    getPublicContact(),
    getInvoiceCopy(locale),
  ]);

  const payload: InvoicePayload = {
    invoiceNumber: "INV-2026-DEMO",
    issuedAt: new Date(),
    clientName: copy.sample.clientName,
    clientEmail: "cliente@example.com",
    description: copy.sample.description,
    amountCents: 85000,
    currency: "mad",
    provider: "PAYZONE",
    status: "PAID",
    statusLabel: getInvoiceStatusLabel(copy, "PAID"),
    sellerEmail: contact.email,
    isSample: true,
  };

  return {
    html: generateInvoiceHtml(payload, copy, locale, {
      downloadUrl: "/api/payments/sample/invoice?download=1",
    }),
    filename: "invoice-sample-DEMO2026.html",
  };
}

export async function buildSampleInvoicePdf(): Promise<{
  pdfBytes: Uint8Array;
  filename: string;
}> {
  const locale = await resolveInvoiceLocale();
  const [contact, copy] = await Promise.all([
    getPublicContact(),
    getInvoiceCopy(locale),
  ]);

  const payload: InvoicePayload = {
    invoiceNumber: "INV-2026-DEMO",
    issuedAt: new Date(),
    clientName: copy.sample.clientName,
    clientEmail: "cliente@example.com",
    description: copy.sample.description,
    amountCents: 85000,
    currency: "mad",
    provider: "PAYZONE",
    status: "PAID",
    statusLabel: getInvoiceStatusLabel(copy, "PAID"),
    sellerEmail: contact.email,
    isSample: true,
  };

  const html = generateInvoiceHtml(payload, copy, locale, {
    showToolbar: false,
    forPdf: true,
  });
  const pdfBytes = await renderInvoicePdfFromHtml(html);

  return {
    pdfBytes,
    filename: "invoice-sample-DEMO2026.pdf",
  };
}
