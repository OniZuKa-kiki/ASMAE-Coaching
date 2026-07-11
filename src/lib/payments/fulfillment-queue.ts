import { inngest } from "@/inngest/client";
import { fulfillVerifiedPayment } from "./fulfillment";
import type { VerifiedPayment } from "./types";

export function isInngestEnabled() {
  return Boolean(process.env.INNGEST_EVENT_KEY?.trim());
}

export async function enqueuePaymentFulfillment(
  verified: VerifiedPayment
): Promise<void> {
  if (verified.status !== "paid") return;

  if (isInngestEnabled()) {
    await inngest.send({
      name: "payment/verified",
      data: { verified },
      id: `payment-fulfillment-${verified.metadata.paymentId}`,
    });
    return;
  }

  await fulfillVerifiedPayment(verified);
}
