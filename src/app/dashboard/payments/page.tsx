import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { InvoiceListTable } from "@/components/payments/invoice-list-table";
import { InvoiceSamplePreviewCard } from "@/components/payments/invoice-sample-preview-card";
import { isAdmin } from "@/lib/auth";
import { getUserPayments } from "@/lib/dashboard";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import {
  buildInvoiceNumber,
  getPaymentServiceTitle,
} from "@/lib/invoice-utils";
import { getPaymentStatusLabels } from "@/lib/payment-i18n";
import { formatProviderAmount } from "@/lib/payments/currency";
import type { AppLocale } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/payments",
    namespace: "dashboard.payments",
    titleKey: "pageTitle",
    descriptionKey: "subtitle",
  });
}

export default async function DashboardPaymentsPage() {
  const [payments, admin, locale, t, statusLabels] = await Promise.all([
    getUserPayments(),
    isAdmin(),
    getLocale() as Promise<AppLocale>,
    getTranslations("dashboard"),
    getPaymentStatusLabels(),
  ]);
  const tPayments = await getTranslations("dashboard.payments");

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
      serviceTitle: getPaymentServiceTitle(
        payment,
        tPayments("fallbackServiceTitle")
      ),
      amountLabel: formatProviderAmount(payment.amount, payment.currency),
      dateLabel: formatDate(payment.createdAt, locale),
      status: payment.status,
      statusLabel: statusLabels[payment.status] || payment.status,
    })) ?? [];

  return (
    <div>
      <h1 className="page-header-title mb-2">{tPayments("pageTitle")}</h1>
      <p className="mb-6 text-sm text-text/70 sm:mb-8">{tPayments("subtitle")}</p>

      {admin ? <InvoiceSamplePreviewCard /> : null}

      {payments && payments.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Card className="px-4 py-3">
            <p className="text-xs text-text/60">{tPayments("paidInvoices")}</p>
            <p className="mt-1 font-heading text-lg font-semibold text-heading">
              {paidPayments.length}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-xs text-text/60">{tPayments("totalPaid")}</p>
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
          <p className="mb-6 text-text/70">{tPayments("empty")}</p>
          <ButtonLink href="/booking">{t("bookSession")}</ButtonLink>
        </Card>
      ) : (
        <InvoiceListTable rows={rows} variant="client" />
      )}
    </div>
  );
}
