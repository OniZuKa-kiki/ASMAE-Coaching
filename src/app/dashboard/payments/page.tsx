import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { InvoiceListTable } from "@/components/payments/invoice-list-table";
import { InvoiceSamplePreviewCard } from "@/components/payments/invoice-sample-preview-card";
import { isAdmin } from "@/lib/auth";
import { getUserPayments } from "@/lib/dashboard";
import {
  buildInvoiceNumber,
  getPaymentServiceTitle,
  paymentStatusLabels,
} from "@/lib/invoice-utils";
import { formatProviderAmount } from "@/lib/payments/currency";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPaymentsPage() {
  const [payments, admin] = await Promise.all([
    getUserPayments(),
    isAdmin(),
  ]);

  const paidPayments = payments?.filter((p) => p.status === "PAID") ?? [];
  const totalPaidMad = paidPayments
    .filter((p) => p.currency.toLowerCase() === "mad")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPaidEur = paidPayments
    .filter((p) => p.currency.toLowerCase() === "eur")
    .reduce((sum, p) => sum + p.amount, 0);

  const rows =
    payments?.map((payment) => ({
      paymentId: payment.id,
      invoiceNumber: buildInvoiceNumber(payment.id, payment.createdAt),
      clientName: "",
      serviceTitle: getPaymentServiceTitle(payment),
      amountLabel: formatProviderAmount(payment.amount, payment.currency),
      dateLabel: formatDate(payment.createdAt),
      status: payment.status,
      statusLabel: paymentStatusLabels[payment.status] || payment.status,
    })) ?? [];

  return (
    <div>
      <h1 className="page-header-title mb-2">المدفوعات والفواتير</h1>
      <p className="mb-6 text-sm text-text/70 sm:mb-8">
        سجلّ مدفوعاتكِ وفواتيركِ — يمكنكِ عرضها أو تحميلها بصيغة PDF.
      </p>

      {admin ? <InvoiceSamplePreviewCard /> : null}

      {payments && payments.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Card className="px-4 py-3">
            <p className="text-xs text-text/60">فواتير مدفوعة</p>
            <p className="mt-1 font-heading text-lg font-semibold text-heading">
              {paidPayments.length}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-xs text-text/60">إجمالي المدفوع</p>
            <p className="mt-1 font-heading text-lg font-semibold text-primary">
              {totalPaidMad > 0
                ? formatProviderAmount(totalPaidMad, "mad")
                : formatProviderAmount(totalPaidEur, "eur")}
            </p>
          </Card>
        </div>
      ) : null}

      {!payments || payments.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="mb-6 text-text/70">سيظهر سجل مدفوعاتكِ هنا.</p>
          <ButtonLink href="/booking">احجزي جلسة</ButtonLink>
        </Card>
      ) : (
        <InvoiceListTable rows={rows} variant="client" />
      )}
    </div>
  );
}
