import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { InvoiceAdminStatsCards } from "@/components/payments/invoice-admin-stats";
import { InvoiceListTable } from "@/components/payments/invoice-list-table";
import { prisma } from "@/lib/db";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { adminFilterLabels } from "@/lib/admin-filters";
import {
  buildInvoiceNumber,
  buildPaymentPeriodWhere,
  buildPaymentSearchWhere,
  getClientDisplayName,
  getInvoiceAdminStats,
  getPaymentServiceTitle,
  paymentStatusLabels,
} from "@/lib/invoice-utils";
import { formatProviderAmount } from "@/lib/payments/currency";
import { formatDate } from "@/lib/utils";

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
  const params = await searchParams;
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
      take: 100,
    }),
    getInvoiceAdminStats(where),
  ]);

  const rows = payments.map((payment) => ({
    paymentId: payment.id,
    invoiceNumber: buildInvoiceNumber(payment.id, payment.createdAt),
    clientName: getClientDisplayName(payment.user),
    clientEmail: payment.user.email,
    serviceTitle: getPaymentServiceTitle(payment),
    amountLabel: formatProviderAmount(payment.amount, payment.currency),
    dateLabel: formatDate(payment.createdAt),
    status: payment.status,
    statusLabel: paymentStatusLabels[payment.status] || payment.status,
  }));

  return (
    <div>
      <h1 className="page-header-title mb-2">الفواتير والمدفوعات</h1>
      <p className="mb-6 text-sm text-text/70 sm:mb-8">
        إدارة الفواتير الصادرة، البحث برقم الفاتورة أو اسم العميلة، وتصفية
        حسب التاريخ والحالة.
      </p>

      <InvoiceAdminStatsCards stats={stats} />

      <AdminFilterCard
        title={adminFilterLabels.payments.title}
        formClassName="grid md:grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <AdminFormField
          label={adminFilterLabels.search}
          htmlFor="payment-filter-q"
          className="lg:col-span-2"
        >
          <Input
            id="payment-filter-q"
            name="q"
            defaultValue={q}
            placeholder={adminFilterLabels.payments.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label="الفترة">
          <FilterSelect
            name="period"
            value={period}
            options={[
              { value: "", label: "كل الفترات" },
              { value: "today", label: "اليوم" },
              { value: "month", label: "هذا الشهر" },
              { value: "year", label: "هذه السنة" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label="حالة الدفع">
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: "جميع الحالات" },
              { value: "PENDING", label: "قيد الانتظار" },
              { value: "PAID", label: "مدفوع" },
              { value: "REFUNDED", label: "مسترد" },
              { value: "FAILED", label: "فاشل" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label="مزود الدفع">
          <FilterSelect
            name="provider"
            value={provider}
            options={[
              { value: "", label: "جميع المزودين" },
              { value: "PAYZONE", label: "PayZone" },
              { value: "STRIPE", label: "Stripe" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={adminFilterLabels.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: adminFilterLabels.sortNewest },
              { value: "created_asc", label: adminFilterLabels.sortOldest },
              { value: "amount_desc", label: "المبلغ ↓" },
              { value: "amount_asc", label: "المبلغ ↑" },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {payments.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">لا توجد فواتير أو مدفوعات مطابقة.</p>
        </Card>
      ) : (
        <InvoiceListTable rows={rows} variant="admin" />
      )}
    </div>
  );
}
