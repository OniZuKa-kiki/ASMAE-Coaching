import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { friendlyErrors, toFriendlyError } from "@/lib/api-errors";
import {
  formatBookingDate,
  reserveBookingSlot,
  SlotUnavailableError,
} from "@/lib/booking";
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
    const body = await request.json();
    const { serviceSlug, date, startTime, provider } = body as {
      serviceSlug: string;
      date: string;
      startTime: string;
      provider?: PaymentProviderId;
    };

    const paymentProvider: PaymentProviderId =
      provider || getDefaultProvider();
    assertPaymentProviderAvailable(paymentProvider);

    if (!serviceSlug || !date || !startTime) {
      return NextResponse.json(
        { error: friendlyErrors.incomplete },
        { status: 400 }
      );
    }

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
    });

    const result = await startPaymentFlow({
      provider: paymentProvider,
      type: "booking",
      amountCentsEur: service.price,
      description: `${service.title} — ${formatBookingDate(booking.date)} à ${startTime}`,
      bookingId: booking.id,
      successPath: "/booking/success",
      cancelPath: `/booking?service=${serviceSlug}`,
    });

    return NextResponse.json(result);
  } catch (error) {
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
