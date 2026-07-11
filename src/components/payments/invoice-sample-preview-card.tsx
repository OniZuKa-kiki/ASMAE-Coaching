"use client";

import { Eye, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { InvoicePdfLink } from "@/components/payments/invoice-pdf-link";
import { formatProviderAmount } from "@/lib/payments/currency";

const sampleInvoiceNumber = "INV-2026-DEMO";
const sampleAmountLabel = formatProviderAmount(85000, "mad");
const sampleProvider = "PayZone";

export function InvoiceSamplePreviewCard() {
  const t = useTranslations("dashboard.payments.sample");
  const tCommon = useTranslations("common");
  const previewUrl = "/api/payments/sample/invoice";
  const downloadUrl = `${previewUrl}?download=1`;

  return (
    <Card className="mb-8 border-dashed border-primary/30 bg-primary/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary">{t("badge")}</p>
            <h2 className="font-heading text-lg font-semibold text-heading">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-text/70">{t("description")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <Eye className="h-4 w-4" />
            {t("viewInvoice")}
          </a>
          <InvoicePdfLink href={downloadUrl} label={tCommon("download")} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-card p-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <p>
            <span className="text-text/60">{t("invoiceNumber")}: </span>
            <span className="font-medium text-heading">{sampleInvoiceNumber}</span>
          </p>
          <p>
            <span className="text-text/60">{t("client")}: </span>
            <span className="font-medium text-heading">{t("demoClientName")}</span>
          </p>
          <p className="sm:col-span-2">
            <span className="text-text/60">{t("descriptionLabel")}: </span>
            <span className="font-medium text-heading">{t("demoDescription")}</span>
          </p>
          <p>
            <span className="text-text/60">{t("amount")}: </span>
            <span className="font-semibold text-primary">{sampleAmountLabel}</span>
          </p>
          <p>
            <span className="text-text/60">{t("provider")}: </span>
            <span className="font-medium text-heading">{sampleProvider}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
