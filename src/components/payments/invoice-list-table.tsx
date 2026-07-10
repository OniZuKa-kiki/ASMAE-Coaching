import { Eye } from "lucide-react";
import { InvoiceDownloadButton } from "@/components/payments/invoice-download-button";
import { cn } from "@/lib/utils";

export type InvoiceTableRow = {
  paymentId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  serviceTitle: string;
  amountLabel: string;
  dateLabel: string;
  status: string;
  statusLabel: string;
};

type InvoiceListTableProps = {
  rows: InvoiceTableRow[];
  variant: "client" | "admin";
  className?: string;
};

function statusClass(status: string): string {
  if (status === "PAID") return "bg-emerald-50 text-emerald-800";
  if (status === "PENDING") return "bg-amber-50 text-amber-800";
  if (status === "REFUNDED") return "bg-rose-50 text-rose-800";
  if (status === "FAILED") return "bg-slate-100 text-slate-700";
  return "bg-muted text-text/80";
}

export function InvoiceListTable({
  rows,
  variant,
  className,
}: InvoiceListTableProps) {
  const showClient = variant === "admin";

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border/70 bg-card",
        className
      )}
    >
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/60 text-right">
            <th className="px-4 py-3 font-semibold text-heading">رقم الفاتورة</th>
            {showClient ? (
              <th className="px-4 py-3 font-semibold text-heading">العميلة</th>
            ) : null}
            <th className="px-4 py-3 font-semibold text-heading">التاريخ</th>
            <th className="px-4 py-3 font-semibold text-heading">الخدمة</th>
            <th className="px-4 py-3 font-semibold text-heading">المبلغ</th>
            <th className="px-4 py-3 font-semibold text-heading">الحالة</th>
            <th className="px-4 py-3 font-semibold text-heading">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const previewUrl = `/api/payments/${row.paymentId}/invoice`;
            const canDownload = row.status === "PAID";

            return (
              <tr
                key={row.paymentId}
                className="border-b border-border/50 last:border-b-0 hover:bg-primary/[0.03]"
              >
                <td className="px-4 py-3 font-mono text-xs font-semibold text-heading whitespace-nowrap">
                  {row.invoiceNumber}
                </td>
                {showClient ? (
                  <td className="px-4 py-3">
                    <p className="font-medium text-heading">{row.clientName}</p>
                    {row.clientEmail ? (
                      <p className="text-xs text-text/60">{row.clientEmail}</p>
                    ) : null}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-text/80 whitespace-nowrap">
                  {row.dateLabel}
                </td>
                <td className="px-4 py-3 text-heading">{row.serviceTitle}</td>
                <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
                  {row.amountLabel}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusClass(row.status)
                    )}
                  >
                    {row.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {canDownload ? (
                      <>
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          عرض
                        </a>
                        <InvoiceDownloadButton
                          paymentId={row.paymentId}
                          label="PDF"
                          className="!px-3 !py-1.5 !text-xs"
                        />
                      </>
                    ) : (
                      <span className="text-xs text-text/50">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
