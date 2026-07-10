import { Eye, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InvoicePdfLink } from "@/components/payments/invoice-pdf-link";
import { formatProviderAmount } from "@/lib/payments/currency";

const samplePreview = {
  invoiceNumber: "INV-2026-DEMO",
  clientName: "فاطمة الزهراء",
  description: "جلسة كوتشينغ فردية — 60 دقيقة",
  amountLabel: formatProviderAmount(85000, "mad"),
  provider: "PayZone",
};

export function InvoiceSamplePreviewCard() {
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
            <p className="text-xs font-medium text-primary">نموذج تجريبي</p>
            <h2 className="font-heading text-lg font-semibold text-heading">
              معاينة الفاتورة
            </h2>
            <p className="mt-1 text-sm text-text/70">
              هكذا ستظهر الفاتورة للعميلات بعد كل دفعة مؤكدة.
            </p>
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
            عرض الفاتورة
          </a>
          <InvoicePdfLink href={downloadUrl} label="تحميل" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border/60 bg-card p-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <p>
            <span className="text-text/60">رقم الفاتورة: </span>
            <span className="font-medium text-heading">
              {samplePreview.invoiceNumber}
            </span>
          </p>
          <p>
            <span className="text-text/60">العميلة: </span>
            <span className="font-medium text-heading">
              {samplePreview.clientName}
            </span>
          </p>
          <p className="sm:col-span-2">
            <span className="text-text/60">الوصف: </span>
            <span className="font-medium text-heading">
              {samplePreview.description}
            </span>
          </p>
          <p>
            <span className="text-text/60">المبلغ: </span>
            <span className="font-semibold text-primary">
              {samplePreview.amountLabel}
            </span>
          </p>
          <p>
            <span className="text-text/60">المزود: </span>
            <span className="font-medium text-heading">
              {samplePreview.provider}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
