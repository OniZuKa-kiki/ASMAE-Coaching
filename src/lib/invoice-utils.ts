import type { Prisma } from "@prisma/client";

export const paymentStatusLabels: Record<string, string> = {
  PAID: "مدفوع",
  PENDING: "قيد الانتظار",
  REFUNDED: "مسترد",
  FAILED: "فشل",
};

/** Numéro lisible type INV-2026-A1B2C3 (dérivé de l'id paiement, stable). */
export function buildInvoiceNumber(
  paymentId: string,
  issuedAt: Date = new Date()
): string {
  const year = issuedAt.getFullYear();
  const suffix = paymentId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

export function getPaymentServiceTitle(payment: {
  booking?: { service: { title: string } } | null;
  course?: { title: string } | null;
}): string {
  return payment.booking?.service.title || payment.course?.title || "دفعة";
}

export function getClientDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}

function extractIdFragmentFromInvoiceQuery(q: string): string {
  const trimmed = q.trim();
  const match = trimmed.match(/^INV-?\d{4}-?(.+)$/i);
  return (match?.[1] ?? trimmed).replace(/[^a-zA-Z0-9]/g, "");
}

export function buildPaymentSearchWhere(
  q: string
): Prisma.PaymentWhereInput | undefined {
  const trimmed = q.trim();
  if (!trimmed) return undefined;

  const idFragment = extractIdFragmentFromInvoiceQuery(trimmed);

  return {
    OR: [
      { user: { email: { contains: trimmed, mode: "insensitive" } } },
      { user: { firstName: { contains: trimmed, mode: "insensitive" } } },
      { user: { lastName: { contains: trimmed, mode: "insensitive" } } },
      {
        booking: {
          service: { title: { contains: trimmed, mode: "insensitive" } },
        },
      },
      { course: { title: { contains: trimmed, mode: "insensitive" } } },
      ...(idFragment.length >= 4
        ? [{ id: { contains: idFragment, mode: "insensitive" as const } }]
        : []),
    ],
  };
}

export function buildPaymentPeriodWhere(
  period: string
): Prisma.PaymentWhereInput | undefined {
  if (!period) return undefined;

  const now = new Date();

  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { createdAt: { gte: start, lte: end } };
  }

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { createdAt: { gte: start, lte: end } };
  }

  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { createdAt: { gte: start, lte: end } };
  }

  return undefined;
}

export type InvoiceAdminStats = {
  total: number;
  paid: number;
  refunded: number;
  pending: number;
  revenueLabel: string;
};

export async function getInvoiceAdminStats(
  where: Prisma.PaymentWhereInput
): Promise<InvoiceAdminStats> {
  const { prisma } = await import("@/lib/db");
  const { formatProviderAmount } = await import("@/lib/payments/currency");
  const { formatPrice } = await import("@/lib/utils");

  const [total, paid, refunded, pending, revenueGroups] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.count({ where: { ...where, status: "PAID" } }),
    prisma.payment.count({ where: { ...where, status: "REFUNDED" } }),
    prisma.payment.count({ where: { ...where, status: "PENDING" } }),
    prisma.payment.groupBy({
      by: ["currency"],
      where: { ...where, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const eur = revenueGroups.find((g) => g.currency.toLowerCase() === "eur");
  const mad = revenueGroups.find((g) => g.currency.toLowerCase() === "mad");
  const revenueLabel = mad?._sum.amount
    ? formatProviderAmount(mad._sum.amount, "mad")
    : eur?._sum.amount
    ? formatPrice(eur._sum.amount, "EUR")
    : formatProviderAmount(0, "mad");

  return { total, paid, refunded, pending, revenueLabel };
}
