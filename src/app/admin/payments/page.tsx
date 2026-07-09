import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

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
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status ? { status: status as "PENDING" | "PAID" | "REFUNDED" | "FAILED" } : {}),
    ...(provider ? { provider: provider as "PAYZONE" | "STRIPE" } : {}),
    ...(q
      ? {
          OR: [
            { user: { email: { contains: q, mode: "insensitive" as const } } },
            { booking: { service: { title: { contains: q, mode: "insensitive" as const } } } },
            { course: { title: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "created_asc"
      ? ({ createdAt: "asc" } as const)
      : sort === "amount_desc"
      ? ({ amount: "desc" } as const)
      : sort === "amount_asc"
      ? ({ amount: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const payments = await prisma.payment.findMany({
    where,
    include: {
      user: true,
      booking: { include: { service: true } },
      course: true,
    },
    orderBy,
    take: 100,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        المدفوعات
      </h1>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-5 gap-4">
          <AdminFormField label="بحث" htmlFor="payment-filter-q">
            <Input
              id="payment-filter-q"
              name="q"
              defaultValue={q}
              placeholder="البريد، الخدمة أو الدورة..."
              className="text-sm"
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
          <AdminFormField label="ترتيب العرض">
            <FilterSelect
              name="sort"
              value={sort}
              options={[
                { value: "created_desc", label: "الأحدث" },
                { value: "created_asc", label: "الأقدم" },
                { value: "amount_desc", label: "المبلغ ↓" },
                { value: "amount_asc", label: "المبلغ ↑" },
              ]}
            />
          </AdminFormField>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors w-full"
            >
              تصفية
            </button>
          </div>
        </form>
      </Card>
      {payments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد مدفوعات حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">
                    {payment.booking?.service.title || payment.course?.title || "دفع"}
                  </p>
                  <p className="text-sm text-text/70">
                    {payment.user.email} • {payment.provider}
                  </p>
                  <p className="text-xs text-text/60">
                    {formatDate(payment.createdAt)} • الحالة: {payment.status}
                  </p>
                </div>
                <p className="font-heading text-lg text-primary">
                  {formatPrice(payment.amount, payment.currency.toUpperCase())}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
