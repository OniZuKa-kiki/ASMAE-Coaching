import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payments/payment-service";
import { fulfillVerifiedPayment } from "@/lib/payments/fulfillment";

export async function POST(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("paymentId");
  const formData = await request.formData();
  const encryptedData = formData.get("data");

  if (!paymentId || typeof encryptedData !== "string") {
    return NextResponse.redirect(
      new URL("/booking?error=payment", request.url)
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment?.providerSessionId) {
    return NextResponse.redirect(
      new URL("/booking?error=payment", request.url)
    );
  }

  const verified = paymentService.verifyPayzoneRedirect(
    encryptedData,
    payment.providerSessionId
  );

  if (verified?.status === "paid") {
    await fulfillVerifiedPayment(verified);
    return NextResponse.redirect(new URL("/booking/success", request.url));
  }

  if (verified?.status === "failed") {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });
    return NextResponse.redirect(
      new URL("/booking?error=payment_failed", request.url)
    );
  }

  return NextResponse.redirect(new URL("/booking/success", request.url));
}
