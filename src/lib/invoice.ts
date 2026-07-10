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
import { getPublicContact } from "@/lib/site-settings";
import { renderInvoicePdfFromHtml } from "@/lib/invoice-pdf";

const paymentStatusLabels: Record<string, string> = {
  PAID: "مدفوع",
  PENDING: "قيد الانتظار",
  REFUNDED: "مسترد",
  FAILED: "فشل",
};

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
  sellerEmail: string
): InvoicePayload {
  const clientName =
    [payment.user.firstName, payment.user.lastName].filter(Boolean).join(" ") ||
    "عميلة";

  return {
    invoiceNumber: buildInvoiceNumber(payment.id, payment.createdAt),
    issuedAt: payment.createdAt,
    clientName,
    clientEmail: payment.user.email,
    description:
      payment.booking?.service.title ||
      payment.course?.title ||
      "دفعة ASMAE Coaching",
    amountCents: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    statusLabel: paymentStatusLabels[payment.status] ?? payment.status,
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

  const contact = await getPublicContact();
  const payload = buildPayloadFromPayment(access.payment, contact.email);
  const html = generateInvoiceHtml(payload, {
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

  const contact = await getPublicContact();
  const payload = buildPayloadFromPayment(access.payment, contact.email);
  const html = generateInvoiceHtml(payload, { showToolbar: false, forPdf: true });
  const pdfBytes = await renderInvoicePdfFromHtml(html);
  const filename = `invoice-${payload.invoiceNumber}.pdf`;

  return { pdfBytes, filename };
}

export async function buildSampleInvoiceHtml(): Promise<{
  html: string;
  filename: string;
}> {
  const contact = await getPublicContact();

  const payload: InvoicePayload = {
    invoiceNumber: "INV-2026-DEMO",
    issuedAt: new Date(),
    clientName: "فاطمة الزهراء",
    clientEmail: "cliente@example.com",
    description: "جلسة كوتشينغ فردية — 60 دقيقة",
    amountCents: 85000,
    currency: "mad",
    provider: "PAYZONE",
    statusLabel: "مدفوع",
    sellerEmail: contact.email,
    isSample: true,
  };

  return {
    html: generateInvoiceHtml(payload, {
      downloadUrl: "/api/payments/sample/invoice?download=1",
    }),
    filename: "invoice-sample-DEMO2026.html",
  };
}

export async function buildSampleInvoicePdf(): Promise<{
  pdfBytes: Uint8Array;
  filename: string;
}> {
  const contact = await getPublicContact();

  const payload: InvoicePayload = {
    invoiceNumber: "INV-2026-DEMO",
    issuedAt: new Date(),
    clientName: "فاطمة الزهراء",
    clientEmail: "cliente@example.com",
    description: "جلسة كوتشينغ فردية — 60 دقيقة",
    amountCents: 85000,
    currency: "mad",
    provider: "PAYZONE",
    statusLabel: "مدفوع",
    sellerEmail: contact.email,
    isSample: true,
  };

  const html = generateInvoiceHtml(payload, { showToolbar: false, forPdf: true });
  const pdfBytes = await renderInvoicePdfFromHtml(html);

  return {
    pdfBytes,
    filename: "invoice-sample-DEMO2026.pdf",
  };
}
