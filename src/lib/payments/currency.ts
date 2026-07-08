import type { PaymentProviderId } from "./types";
import { siteLocale } from "@/lib/locale";

/** Prix catalogue stockés en centimes EUR */
export const CATALOG_CURRENCY = "eur";

export function getProviderCurrency(provider: PaymentProviderId): string {
  if (provider === "payzone") return "mad";
  return CATALOG_CURRENCY;
}

export function convertCatalogAmountToProvider(
  amountCentsEur: number,
  provider: PaymentProviderId
): { amountCents: number; currency: string } {
  if (provider === "payzone") {
    const rate = Number(process.env.EUR_TO_MAD_RATE || "10.85");
    return {
      amountCents: Math.round(amountCentsEur * rate),
      currency: "mad",
    };
  }
  return { amountCents: amountCentsEur, currency: CATALOG_CURRENCY };
}

export function formatProviderAmount(
  amountCents: number,
  currency: string
): string {
  return new Intl.NumberFormat(siteLocale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}
