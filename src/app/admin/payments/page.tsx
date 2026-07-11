import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { InvoiceAdminStatsCards } from "@/components/payments/invoice-admin-stats";
import { InvoiceListTable } from "@/components/payments/invoice-list-table";
import { prisma } from "@/lib/db";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import { adminListLimits } from "@/lib/admin-filters";
import { getAdminFilters } from "@/lib/admin-i18n";
import {
  buildInvoiceNumber,
  buildPaymentPeriodWhere,
  buildPaymentSearchWhere,
  getClientDisplayName,
  getInvoiceAdminStats,
  getPaymentServiceTitle,
} from "@/lib/invoice-utils";
import { formatProviderAmount } from "@/lib/payments/currency";
import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tPaymentStatuses, tEmpty] = await Promise.all([
    searchParams,
    getTranslations("adminPages.payments"),
    getTranslations("adminPages.filters"),
    getTranslations("adminPages.statuses.payment"),
    getTranslations("adminPages.empty"),
  ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const status = getQueryValue(params.status).trim();
  const provider = getQueryValue(params.provider).trim();
  const period = getQueryValue(params.period).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status
      ? { status: status as "PENDING" | "PAID" | "REFUNDED" | "FAILED" }
      : {}),
    ...(provider ? { provider: provider as "PAYZONE" | "STRIPE" } : {}),
    ...(buildPaymentPeriodWhere(period) ?? {}),
    ...(buildPaymentSearchWhere(q) ?? {}),
  };

  const orderBy =
    sort === "created_asc"
      ? ({ createdAt: "asc" } as const)
      : sort === "amount_desc"
      ? ({ amount: "desc" } as const)
      : sort === "amount_asc"
      ? ({ amount: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: true,
        booking: { include: { service: true } },
        course: true,
      },
      orderBy,
      take: adminListLimits.payments,
    }),
    getInvoiceAdminStats(where),
  ]);

  const rows = payments.map((payment) => ({
    paymentId: payment.id,
    invoiceNumber: buildInvoiceNumber(payment.id, payment.createdAt),
    clientName: getClientDisplayName(payment.user),
    clientEmail: payment.user.email,
    serviceTitle: getPaymentServiceTitle(payment, t("fallbackServiceTitle")),
    amountLabel: formatProviderAmount(payment.amount, payment.currency),
    dateLabel: formatDate(payment.createdAt, locale),
    status: payment.status,
    statusLabel: tPaymentStatuses(payment.status) || payment.status,
  }));

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("title")}</h1>
      <p className="mb-6 text-sm text-text/70 sm:mb-8">{t("subtitle")}</p>

      <InvoiceAdminStatsCards stats={stats} />

      <AdminFilterCard
        title={filters.payments.title}
        formClassName="grid md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <AdminFormField
          label={filters.search}
          htmlFor="payment-filter-q"
          className="lg:col-span-2"
        >
          <Input
            id="payment-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.payments.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={t("period")}>
          <FilterSelect
            name="period"
            value={period}
            options={[
              { value: "", label: tFilters("allPeriods") },
              { value: "today", label: tFilters("periodToday") },
              { value: "month", label: tFilters("periodMonth") },
              { value: "year", label: tFilters("periodYear") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={tFilters("paymentStatus")}>
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: tFilters("allStatuses") },
              { value: "PENDING", label: tPaymentStatuses("PENDING") },
              { value: "PAID", label: tPaymentStatuses("PAID") },
              { value: "REFUNDED", label: tPaymentStatuses("REFUNDED") },
              { value: "FAILED", label: tPaymentStatuses("FAILED") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={t("provider")}>
          <FilterSelect
            name="provider"
            value={provider}
            options={[
              { value: "", label: tFilters("allProviders") },
              { value: "PAYZONE", label: "PayZone" },
              { value: "STRIPE", label: "Stripe" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "created_asc", label: filters.sortOldest },
              { value: "amount_desc", label: filters.sortAmountDesc },
              { value: "amount_asc", label: filters.sortAmountAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {payments.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noPayments")}</p>
        </Card>
      ) : (
        <>
          <InvoiceListTable rows={rows} variant="admin" />
          <AdminListLimitNotice
            shown={payments.length}
            limit={adminListLimits.payments}
          />
        </>
      )}
    </div>
  );
}
