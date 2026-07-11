import "server-only";

import { formatProviderAmount } from "@/lib/payments/currency";
import { siteConfig } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { getEmbeddedCairoFontCss } from "@/lib/invoice-font";
import type { AppLocale } from "@/i18n/routing";
import type { InvoiceCopy } from "@/lib/invoice-i18n";

export type InvoicePayload = {
  invoiceNumber: string;
  issuedAt: Date;
  clientName: string;
  clientEmail: string;
  description: string;
  amountCents: number;
  currency: string;
  provider: string;
  status: string;
  statusLabel: string;
  sellerEmail: string;
  isSample?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatProviderLabel(provider: string): string {
  if (provider === "PAYZONE") return "PayZone";
  if (provider === "STRIPE") return "Stripe";
  return provider;
}

function statusBadgeClass(status: string): string {
  if (status === "PAID") return "status status--paid";
  if (status === "PENDING") return "status status--pending";
  if (status === "REFUNDED") return "status status--refunded";
  return "status";
}

type GenerateInvoiceHtmlOptions = {
  showToolbar?: boolean;
  downloadUrl?: string;
  /** Mise en page compacte pour l'export PDF (marges minimales). */
  forPdf?: boolean;
};

export function generateInvoiceHtml(
  invoice: InvoicePayload,
  copy: InvoiceCopy,
  locale: AppLocale,
  options: GenerateInvoiceHtmlOptions = {}
): string {
  const showToolbar = options.showToolbar !== false;
  const forPdf = options.forPdf === true;
  const downloadUrl = options.downloadUrl ?? "";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const embeddedFonts = getEmbeddedCairoFontCss();
  const amountLabel = formatProviderAmount(
    invoice.amountCents,
    invoice.currency
  );
  const dateLabel = formatDate(invoice.issuedAt, locale);
  const providerLabel = formatProviderLabel(invoice.provider);
  const statusClass = statusBadgeClass(invoice.status);
  const pageTitle = copy.pageTitle
    .replace("{number}", invoice.invoiceNumber)
    .replace("{site}", siteConfig.name);
  const thanksLine = copy.thanks.replace("{site}", siteConfig.name);
  const sampleBadge = invoice.isSample
    ? `<span class="badge">${escapeHtml(copy.sampleBadge)}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    ${embeddedFonts}
    :root {
      --bg: #f4f2ed;
      --card: #ffffff;
      --heading: #1f1f1f;
      --text: #5c5c5c;
      --muted-label: #8a8a8a;
      --primary: #6b7c6a;
      --primary-dark: #556654;
      --border: #e4dfd6;
      --muted: #f8f6f2;
      --paid: #2f6b4f;
      --paid-bg: #eaf4ee;
      --pending: #9a6b2f;
      --pending-bg: #fff3e0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--heading);
      font-family: "Cairo", system-ui, sans-serif;
      font-size: 13px;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: flex-end;
    }
    .toolbar a {
      display: inline-flex;
      align-items: center;
      border: 0;
      border-radius: 999px;
      background: var(--primary);
      color: #fff;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 18px;
      text-decoration: none;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
    }
    .accent-bar {
      height: 5px;
      background: linear-gradient(90deg, var(--primary-dark), var(--primary));
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding: 22px 28px 18px;
      border-bottom: 1px solid var(--border);
    }
    .brand h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary-dark);
      letter-spacing: -0.02em;
    }
    .brand .tagline {
      margin: 4px 0 0;
      color: var(--text);
      font-size: 12px;
    }
    .brand .contact {
      margin: 10px 0 0;
      color: var(--muted-label);
      font-size: 11px;
    }
    .title-block {
      text-align: end;
      min-width: 160px;
    }
    .title-block .doc-type {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: var(--heading);
      line-height: 1.1;
    }
    .title-block .doc-number {
      margin: 6px 0 0;
      font-size: 12px;
      color: var(--muted-label);
      font-weight: 600;
      letter-spacing: 0.06em;
    }
    .title-block .doc-number strong {
      display: block;
      margin-top: 2px;
      font-size: 15px;
      color: var(--heading);
      letter-spacing: 0.04em;
    }
    .badge {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--pending-bg);
      color: var(--pending);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      border-bottom: 1px solid var(--border);
    }
    .panel {
      padding: 18px 28px;
    }
    .panel + .panel {
      border-inline-start: 1px solid var(--border);
    }
    .panel-title {
      margin: 0 0 10px;
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .panel-body p {
      margin: 0 0 8px;
      font-size: 13px;
    }
    .panel-body p:last-child { margin-bottom: 0; }
    .panel-body .label {
      display: block;
      font-size: 10px;
      color: var(--muted-label);
      margin-bottom: 2px;
    }
    .panel-body .value {
      font-weight: 600;
      color: var(--heading);
    }
    .meta-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .meta-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 5px 0;
      border-bottom: 1px dashed var(--border);
      font-size: 12px;
    }
    .meta-list li:last-child { border-bottom: 0; }
    .meta-list .label { color: var(--muted-label); }
    .meta-list .value { font-weight: 600; text-align: end; }
    .status {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      background: var(--muted);
      color: var(--text);
    }
    .status--paid { background: var(--paid-bg); color: var(--paid); }
    .status--pending { background: var(--pending-bg); color: var(--pending); }
    .status--refunded { background: #fce8e8; color: #8b3a3a; }
    .lines {
      padding: 18px 28px 8px;
    }
    .lines h3 {
      margin: 0 0 12px;
      font-size: 10px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    thead th {
      padding: 10px 14px;
      text-align: start;
      background: var(--primary);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    thead th:first-child { width: 36px; text-align: center; }
    thead th:last-child { width: 120px; text-align: end; }
    tbody td {
      padding: 12px 14px;
      text-align: start;
      border-top: 1px solid var(--border);
      font-size: 13px;
      vertical-align: top;
    }
    tbody td:first-child {
      text-align: center;
      color: var(--muted-label);
      font-weight: 600;
      background: var(--muted);
    }
    tbody td:last-child {
      text-align: end;
      font-weight: 700;
      color: var(--heading);
      white-space: nowrap;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
      padding: 4px 28px 20px;
    }
    .totals-box {
      min-width: 240px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--muted);
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      font-size: 12px;
      border-bottom: 1px solid var(--border);
    }
    .totals-row:last-child {
      border-bottom: 0;
      background: var(--primary);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      padding: 12px 16px;
    }
    .totals-row .amount { font-variant-numeric: tabular-nums; }
    .footer {
      padding: 14px 28px 18px;
      border-top: 1px solid var(--border);
      background: var(--muted);
    }
    .footer .thanks {
      margin: 0 0 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--heading);
    }
    .footer .legal {
      margin: 0;
      font-size: 10px;
      color: var(--muted-label);
      line-height: 1.5;
    }
    .footer .site {
      margin: 6px 0 0;
      font-size: 10px;
      color: var(--primary);
      font-weight: 600;
    }
    @media (max-width: 640px) {
      body { padding: 12px; }
      .header, .panel, .lines, .totals, .footer { padding-right: 16px; padding-left: 16px; }
      .panels { grid-template-columns: 1fr; }
      .panel + .panel { border-inline-start: 0; border-top: 1px solid var(--border); }
      .title-block { text-align: start; }
    }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .invoice { box-shadow: none; border: 0; border-radius: 0; max-width: none; }
    }
    body.pdf-export {
      padding: 8mm 7mm;
      background: #fff;
      font-size: 12px;
    }
    body.pdf-export .invoice {
      max-width: none;
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 6px;
      box-shadow: none;
    }
    body.pdf-export .header { padding: 16px 20px 14px; }
    body.pdf-export .panel { padding: 14px 20px; }
    body.pdf-export .lines { padding: 14px 20px 6px; }
    body.pdf-export .totals { padding: 4px 20px 14px; }
    body.pdf-export .footer { padding: 12px 20px 14px; }
  </style>
</head>
<body${forPdf ? ' class="pdf-export"' : ""}>
  ${
    showToolbar && downloadUrl
      ? `<div class="toolbar no-print">
    <a href="${escapeHtml(downloadUrl)}">${escapeHtml(copy.downloadPdf)}</a>
  </div>`
      : ""
  }

  <article class="invoice">
    <div class="accent-bar" aria-hidden="true"></div>

    <header class="header">
      <div class="brand">
        <h1>${escapeHtml(siteConfig.name)} Coaching</h1>
        <p class="tagline">${escapeHtml(copy.tagline)}</p>
        <p class="contact">${escapeHtml(invoice.sellerEmail)}</p>
      </div>
      <div class="title-block">
        <p class="doc-type">${escapeHtml(copy.documentTitle)}</p>
        <p class="doc-number">
          ${escapeHtml(copy.invoiceNumberLabel)}
          <strong>${escapeHtml(invoice.invoiceNumber)}</strong>
        </p>
        ${sampleBadge}
      </div>
    </header>

    <div class="panels">
      <section class="panel">
        <h3 class="panel-title">${escapeHtml(copy.billTo)}</h3>
        <div class="panel-body">
          <p>
            <span class="label">${escapeHtml(copy.name)}</span>
            <span class="value">${escapeHtml(invoice.clientName)}</span>
          </p>
          <p>
            <span class="label">${escapeHtml(copy.email)}</span>
            <span class="value">${escapeHtml(invoice.clientEmail)}</span>
          </p>
        </div>
      </section>
      <section class="panel">
        <h3 class="panel-title">${escapeHtml(copy.invoiceInfo)}</h3>
        <ul class="meta-list">
          <li>
            <span class="label">${escapeHtml(copy.issuedAt)}</span>
            <span class="value">${escapeHtml(dateLabel)}</span>
          </li>
          <li>
            <span class="label">${escapeHtml(copy.status)}</span>
            <span class="value"><span class="${statusClass}">${escapeHtml(invoice.statusLabel)}</span></span>
          </li>
          <li>
            <span class="label">${escapeHtml(copy.paymentMethod)}</span>
            <span class="value">${escapeHtml(providerLabel)}</span>
          </li>
        </ul>
      </section>
    </div>

    <section class="lines">
      <h3>${escapeHtml(copy.serviceDetails)}</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${escapeHtml(copy.description)}</th>
            <th>${escapeHtml(copy.amount)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${escapeHtml(invoice.description)}</td>
            <td>${escapeHtml(amountLabel)}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>${escapeHtml(copy.subtotal)}</span>
          <span class="amount">${escapeHtml(amountLabel)}</span>
        </div>
        <div class="totals-row">
          <span>${escapeHtml(copy.totalPaid)}</span>
          <span class="amount">${escapeHtml(amountLabel)}</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p class="thanks">${escapeHtml(thanksLine)}</p>
      <p class="legal">${escapeHtml(copy.legal)}</p>
      <p class="site">${escapeHtml(siteConfig.url)}</p>
    </footer>
  </article>
</body>
</html>`;
}