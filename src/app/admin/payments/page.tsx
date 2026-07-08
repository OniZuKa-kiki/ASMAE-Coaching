import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
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
        Paiements
      </h1>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-5 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher email, service, formation..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: "Tous statuts" },
              { value: "PENDING", label: "PENDING" },
              { value: "PAID", label: "PAID" },
              { value: "REFUNDED", label: "REFUNDED" },
              { value: "FAILED", label: "FAILED" },
            ]}
          />
          <FilterSelect
            name="provider"
            value={provider}
            options={[
              { value: "", label: "Tous providers" },
              { value: "PAYZONE", label: "PAYZONE" },
              { value: "STRIPE", label: "STRIPE" },
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récents" },
              { value: "created_asc", label: "Plus anciens" },
              { value: "amount_desc", label: "Montant ↓" },
              { value: "amount_asc", label: "Montant ↑" },
            ]}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Filtrer
          </button>
        </form>
      </Card>
      {payments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucun paiement pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">
                    {payment.booking?.service.title || payment.course?.title || "Paiement"}
                  </p>
                  <p className="text-sm text-text/70">
                    {payment.user.email} • {payment.provider}
                  </p>
                  <p className="text-xs text-text/60">
                    {formatDate(payment.createdAt)} • Statut: {payment.status}
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
