"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { InvoiceDownloadButton } from "@/components/payments/invoice-download-button";
import { SCROLL_LIST_THRESHOLD } from "@/components/ui/scalable-list";
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
  const t = useTranslations("dashboard.payments.table");
  const tAdmin = useTranslations("adminPages.invoiceTable");
  const showClient = variant === "admin";
  const headers =
    variant === "client"
      ? {
          invoiceNumber: t("invoiceNumber"),
          client: t("client"),
          date: t("date"),
          service: t("service"),
          amount: t("amount"),
          status: t("status"),
          action: t("action"),
          view: t("view"),
        }
      : {
          invoiceNumber: tAdmin("invoiceNumber"),
          client: tAdmin("client"),
          date: tAdmin("date"),
          service: tAdmin("service"),
          amount: tAdmin("amount"),
          status: tAdmin("status"),
          action: tAdmin("action"),
          view: tAdmin("view"),
        };

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border/70 bg-card",
        rows.length > SCROLL_LIST_THRESHOLD &&
          "max-h-96 overflow-y-auto sm:max-h-[28rem]",
        className
      )}
    >
      <table
        className={cn(
          "min-w-full border-collapse text-sm",
          showClient && "min-w-[640px]"
        )}
      >
        <thead>
          <tr className="border-b border-border/70 bg-muted/60 text-right">
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.invoiceNumber}
            </th>
            {showClient ? (
              <th className="px-4 py-3 font-semibold text-heading">
                {headers.client}
              </th>
            ) : null}
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.date}
            </th>
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.service}
            </th>
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.amount}
            </th>
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.status}
            </th>
            <th className="px-4 py-3 font-semibold text-heading">
              {headers.action}
            </th>
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
                          {headers.view}
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
