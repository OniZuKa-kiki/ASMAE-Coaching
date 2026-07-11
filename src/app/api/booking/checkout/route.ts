import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingCheckoutSchema } from "@/lib/api-schemas";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { toFriendlyError } from "@/lib/api-errors";
import { getRequestFriendlyErrors } from "@/lib/action-locale";
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
import { getRequestLocale } from "@/lib/request-locale";

export async function POST(request: NextRequest) {
  const locale = await getRequestLocale();
  const errors = await getRequestFriendlyErrors();

  try {
    if (!isAnyPaymentProviderConfigured()) {
      return NextResponse.json(
        { error: errors.paymentUnavailable },
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
        { error: errors.serviceNotFound },
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
      const needsReasonDetail = error.issues.some(
        (issue) => issue.message === "BOOKING_REASON_OTHER_DETAIL"
      );
      return NextResponse.json(
        {
          error: needsReasonDetail
            ? errors.bookingReasonOtherDetail
            : errors.incomplete,
        },
        { status: 400 }
      );
    }
    if (error instanceof SlotUnavailableError) {
      return NextResponse.json(
        { error: errors.slotUnavailable },
        { status: 409 }
      );
    }
    const raw =
      error instanceof Error ? error.message : errors.generic;
    const status = raw === "Non authentifié" ? 401 : 500;
    return NextResponse.json(
      { error: toFriendlyError(raw, status, locale) },
      { status }
    );
  }
}
