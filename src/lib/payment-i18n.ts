import { getTranslations } from "next-intl/server";

const PAYMENT_STATUS_KEYS = ["PAID", "PENDING", "REFUNDED", "FAILED"] as const;

export async function getPaymentStatusLabels(): Promise<Record<string, string>> {
  const t = await getTranslations("dashboard.payments.statuses");
  return Object.fromEntries(
    PAYMENT_STATUS_KEYS.map((key) => [key, t(key)])
  );
}
