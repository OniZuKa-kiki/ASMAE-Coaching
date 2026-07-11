"use client";

import { useTranslations } from "next-intl";
import { InvoicePdfLink } from "@/components/payments/invoice-pdf-link";

type InvoiceDownloadButtonProps = {
  paymentId: string;
  className?: string;
  label?: string;
};

export function InvoiceDownloadButton({
  paymentId,
  className,
  label,
}: InvoiceDownloadButtonProps) {
  const t = useTranslations("dashboard.payments");

  return (
    <InvoicePdfLink
      href={`/api/payments/${paymentId}/invoice?download=1`}
      label={label ?? t("downloadInvoice")}
      className={className}
    />
  );
}
