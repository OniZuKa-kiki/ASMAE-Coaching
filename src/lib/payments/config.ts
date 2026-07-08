import type { PaymentProviderConfig, PaymentProviderId } from "./types";

export function isPayzoneConfigured(): boolean {
  return Boolean(
    process.env.PAYZONE_ORIGINATOR_ID && process.env.PAYZONE_PASSWORD
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getDefaultProvider(): PaymentProviderId {
  const configured = process.env.PAYMENT_DEFAULT_PROVIDER as
    | PaymentProviderId
    | undefined;
  if (configured === "stripe" && isStripeConfigured()) return "stripe";
  if (configured === "payzone" && isPayzoneConfigured()) return "payzone";
  if (isPayzoneConfigured()) return "payzone";
  if (isStripeConfigured()) return "stripe";
  return "payzone";
}

export function getAvailableProviders(): PaymentProviderConfig[] {
  const providers: PaymentProviderConfig[] = [
    {
      id: "payzone",
      label: "بطاقة مغربية",
      description: "Visa، Mastercard، بطاقات CMI",
      flag: "🇲🇦",
      available: isPayzoneConfigured(),
    },
    {
      id: "stripe",
      label: "بطاقة دولية",
      description: "Visa، Mastercard (خارج المغرب)",
      flag: "🌍",
      available: isStripeConfigured(),
    },
  ];

  return providers.filter((p) => p.available);
}

export function isAnyPaymentProviderConfigured(): boolean {
  return isPayzoneConfigured() || isStripeConfigured();
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
