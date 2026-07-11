import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payments/payment-service";
import { enqueuePaymentFulfillment } from "@/lib/payments/fulfillment-queue";
import type { PayzoneStatusPayload } from "@/lib/payments/payzone-crypto";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PayzoneStatusPayload;
    const verified = paymentService.verifyPayzoneCallback(body);

    if (!verified) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: verified.metadata.paymentId },
    });

    if (
      payment?.providerSessionId &&
      body.merchantToken &&
      payment.providerSessionId !== body.merchantToken
    ) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 });
    }

    if (verified.status === "paid") {
      await enqueuePaymentFulfillment(verified);
    } else if (verified.status === "failed") {
      await prisma.payment.update({
        where: { id: verified.metadata.paymentId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
