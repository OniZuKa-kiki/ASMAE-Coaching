import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getUserPayments } from "@/lib/dashboard";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PAID: "مدفوع",
  PENDING: "قيد الانتظار",
  REFUNDED: "مسترد",
  FAILED: "فشل",
};

export default async function DashboardPaymentsPage() {
  const payments = await getUserPayments();

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        المدفوعات والفواتير
      </h1>

      {!payments || payments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70 mb-6">
            سيظهر سجل مدفوعاتك هنا.
          </p>
          <ButtonLink href="/booking">حجز جلسة</ButtonLink>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-heading">
                    {payment.booking?.service.title ||
                      payment.course?.title ||
                      "دفعة"}
                  </p>
                  <p className="text-sm text-text/70">
                    {formatDate(payment.createdAt)} —{" "}
                    {statusLabels[payment.status] || payment.status}
                  </p>
                </div>
                <p className="font-heading text-lg text-primary">
                  {formatPrice(payment.amount)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
