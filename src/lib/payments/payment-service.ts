import { PaymentProvider as PrismaPaymentProvider } from "@prisma/client";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProviderId,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifiedPayment,
} from "./types";
import {
  payzoneCreatePayment,
  payzoneRefundPayment,
  payzoneVerifyCallback,
  payzoneVerifyPayment,
  payzoneVerifyRedirect,
} from "./providers/payzone";
import {
  stripeCreatePayment,
  stripeRefundPayment,
  stripeVerifyPayment,
} from "./providers/stripe";
import { isPayzoneConfigured, isStripeConfigured } from "./config";
import type { PayzoneStatusPayload } from "./payzone-crypto";

function assertProviderAvailable(provider: PaymentProviderId): void {
  if (provider === "payzone" && !isPayzoneConfigured()) {
    throw new Error("PayZone non configuré");
  }
  if (provider === "stripe" && !isStripeConfigured()) {
    throw new Error("Stripe non configuré");
  }
}

export function toPrismaProvider(
  provider: PaymentProviderId
): PrismaPaymentProvider {
  return provider === "stripe"
    ? PrismaPaymentProvider.STRIPE
    : PrismaPaymentProvider.PAYZONE;
}

export const paymentService = {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    assertProviderAvailable(input.provider);

    if (input.provider === "payzone") {
      return payzoneCreatePayment(input);
    }
    return stripeCreatePayment(input);
  },

  async verifyPayment(
    provider: PaymentProviderId,
    sessionId: string
  ): Promise<VerifiedPayment | null> {
    if (provider === "payzone") {
      return payzoneVerifyPayment(sessionId);
    }
    return stripeVerifyPayment(sessionId);
  },

  verifyPayzoneRedirect(
    encryptedData: string,
    merchantToken: string
  ): VerifiedPayment | null {
    return payzoneVerifyRedirect(encryptedData, merchantToken);
  },

  verifyPayzoneCallback(
    payload: PayzoneStatusPayload
  ): VerifiedPayment | null {
    return payzoneVerifyCallback(payload);
  },

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    if (input.provider === "payzone") {
      return payzoneRefundPayment(input);
    }
    return stripeRefundPayment(input);
  },
};
