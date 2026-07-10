import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingCheckoutSchema } from "@/lib/api-schemas";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { friendlyErrors, toFriendlyError } from "@/lib/api-errors";
import {
  formatBookingDate,
  reserveBookingSlot,
  SlotUnavailableError,
} from "@/lib/booking";
import { formatBookingIntentNotes } from "@/lib/booking-reasons";
import {
  assertPaymentProviderAvailable,
  startPaymentFlow,
} from "@/lib/payments/checkout";
import { getDefaultProvider } from "@/lib/payments/config";
import type { PaymentProviderId } from "@/lib/payments/types";
import { isAnyPaymentProviderConfigured } from "@/lib/payments/config";

export async function POST(request: NextRequest) {
  try {
    if (!isAnyPaymentProviderConfigured()) {
      return NextResponse.json(
        { error: friendlyErrors.paymentUnavailable },
        { status: 503 }
      );
    }

    const user = await requireUser();
    const body = bookingCheckoutSchema.parse(await request.json());
    const {
      serviceSlug,
      date,
      startTime,
      provider,
      bookingReason,
      bookingReasonDetail,
    } = body;

    const paymentProvider: PaymentProviderId =
      (provider as PaymentProviderId | undefined) || getDefaultProvider();
    assertPaymentProviderAvailable(paymentProvider);

    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug, isActive: true },
    });
    if (!service) {
      return NextResponse.json(
        { error: "الخدمة غير موجودة" },
        { status: 404 }
      );
    }

    const booking = await reserveBookingSlot({
      userId: user.id,
      serviceId: service.id,
      dateStr: date,
      startTime,
      serviceSlug,
      notes: formatBookingIntentNotes(bookingReason, bookingReasonDetail),
    });

    const result = await startPaymentFlow({
      provider: paymentProvider,
      type: "booking",
      amountCentsEur: service.price,
      description: `${service.title} — ${formatBookingDate(booking.date)} à ${startTime}`,
      bookingId: booking.id,
      successPath: "/booking/success",
      cancelPath: `/booking/cancel`,
    });

    auditLog({
      action: "booking.checkout_started",
      actorId: user.id,
      actorEmail: user.email,
      target: booking.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: friendlyErrors.incomplete },
        { status: 400 }
      );
    }
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json(
        { error: friendlyErrors.slotUnavailable },
        { status: 409 }
      );
    }
    const raw =
      error instanceof Error ? error.message : friendlyErrors.generic;
    const status = raw === "Non authentifié" ? 401 : 500;
    return NextResponse.json(
      { error: toFriendlyError(raw, status) },
      { status }
    );
  }
}
