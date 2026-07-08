import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { friendlyErrors } from "@/lib/api-errors";
import { convertCatalogAmountToProvider } from "@/lib/payments/currency";
import {
  paymentService,
  toPrismaProvider,
} from "@/lib/payments/payment-service";
import type {
  PaymentItemType,
  PaymentProviderId,
} from "@/lib/payments/types";

interface StartPaymentInput {
  provider: PaymentProviderId;
  type: PaymentItemType;
  amountCentsEur: number;
  description: string;
  bookingId?: string;
  courseId?: string;
  successPath: string;
  cancelPath: string;
}

export async function startPaymentFlow(input: StartPaymentInput) {
  const user = await requireUser();
  const { amountCents, currency } = convertCatalogAmountToProvider(
    input.amountCentsEur,
    input.provider
  );

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      bookingId: input.bookingId,
      courseId: input.courseId,
      amount: amountCents,
      currency,
      provider: toPrismaProvider(input.provider),
      status: "PENDING",
    },
  });

  const result = await paymentService.createPayment({
    provider: input.provider,
    orderId: payment.id,
    amountCents,
    currency,
    description: input.description,
    customerEmail: user.email,
    customerFirstName: user.firstName,
    customerLastName: user.lastName,
    metadata: {
      type: input.type,
      paymentId: payment.id,
      userId: user.id,
      bookingId: input.bookingId,
      courseId: input.courseId,
    },
    successPath: input.successPath,
    cancelPath: input.cancelPath,
  });

  if (input.bookingId) {
    await prisma.booking.update({
      where: { id: input.bookingId },
      data: { providerSessionId: result.providerSessionId },
    });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerSessionId: result.providerSessionId },
  });

  return { url: result.redirectUrl, paymentId: payment.id };
}

export function assertPaymentProviderAvailable(
  provider: PaymentProviderId
): void {
  const available =
    provider === "payzone"
      ? Boolean(
          process.env.PAYZONE_ORIGINATOR_ID && process.env.PAYZONE_PASSWORD
        )
      : Boolean(process.env.STRIPE_SECRET_KEY);

  if (!available) {
    throw new Error(friendlyErrors.paymentUnavailable);
  }
}
