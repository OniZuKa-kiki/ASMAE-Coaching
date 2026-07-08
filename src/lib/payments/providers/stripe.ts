import { stripe } from "@/lib/stripe";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentMetadata,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifiedPayment,
} from "../types";
import { getAppUrl } from "../config";

function metadataToStripeRecord(metadata: PaymentMetadata): Record<string, string> {
  return {
    type: metadata.type,
    paymentId: metadata.paymentId,
    userId: metadata.userId,
    ...(metadata.bookingId ? { bookingId: metadata.bookingId } : {}),
    ...(metadata.courseId ? { courseId: metadata.courseId } : {}),
  };
}

function stripeRecordToMetadata(
  record: Record<string, string>
): PaymentMetadata | null {
  if (!record.type || !record.paymentId || !record.userId) return null;
  return {
    type: record.type as PaymentMetadata["type"],
    paymentId: record.paymentId,
    userId: record.userId,
    bookingId: record.bookingId,
    courseId: record.courseId,
  };
}

export async function stripeCreatePayment(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  if (!stripe) throw new Error("Stripe non configuré");

  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency,
          product_data: {
            name: input.description,
          },
          unit_amount: input.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: metadataToStripeRecord(input.metadata),
    success_url: `${appUrl}${input.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${input.cancelPath}`,
  });

  if (!session.url) {
    throw new Error("URL de paiement Stripe indisponible");
  }

  return {
    redirectUrl: session.url,
    providerSessionId: session.id,
  };
}

export async function stripeVerifyPayment(
  sessionId: string
): Promise<VerifiedPayment | null> {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return null;

  const metadata = stripeRecordToMetadata(
    (session.metadata || {}) as Record<string, string>
  );
  if (!metadata) return null;

  return {
    orderId: metadata.paymentId,
    providerPaymentId: String(session.payment_intent || session.id),
    status: "paid",
    metadata,
  };
}

export async function stripeRefundPayment(
  input: RefundPaymentInput
): Promise<RefundPaymentResult> {
  if (!stripe) {
    return { success: false, message: "Stripe non configuré" };
  }

  try {
    await stripe.refunds.create({
      payment_intent: input.providerPaymentId,
      amount: input.amountCents,
      reason: "requested_by_customer",
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Remboursement impossible";
    return { success: false, message };
  }
}
