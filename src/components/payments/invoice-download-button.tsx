import { InvoicePdfLink } from "@/components/payments/invoice-pdf-link";

type InvoiceDownloadButtonProps = {
  paymentId: string;
  className?: string;
  label?: string;
};

export function InvoiceDownloadButton({
  paymentId,
  className,
  label = "تحميل الفاتورة",
}: InvoiceDownloadButtonProps) {
  return (
    <InvoicePdfLink
      href={`/api/payments/${paymentId}/invoice?download=1`}
      label={label}
      className={className}
    />
  );
}
