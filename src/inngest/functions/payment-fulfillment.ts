import {
  fulfillBookingPayment,
  fulfillCoursePayment,
  markPaymentPaid,
  sendBookingFulfillmentNotifications,
} from "@/lib/payments/fulfillment";
import type { VerifiedPayment } from "@/lib/payments/types";
import { inngest } from "../client";

export const fulfillVerifiedPaymentJob = inngest.createFunction(
  {
    id: "fulfill-verified-payment",
    retries: 4,
    triggers: [{ event: "payment/verified" }],
  },
  async ({ event, step }) => {
    const verified = event.data.verified as VerifiedPayment;

    const marked = await step.run("mark-paid", () => markPaymentPaid(verified));
    if (!marked) {
      return { status: "skipped" as const };
    }

    if (marked.type === "booking") {
      await step.run("confirm-booking", () =>
        fulfillBookingPayment(marked.paymentId)
      );
      await step.run("booking-notifications", () =>
        sendBookingFulfillmentNotifications(marked.paymentId)
      );
      return { status: "booking-fulfilled" as const };
    }

    if (marked.type === "course") {
      await step.run("fulfill-course", () =>
        fulfillCoursePayment(marked.paymentId)
      );
      return { status: "course-fulfilled" as const };
    }

    return { status: "unknown-type" as const };
  }
);

export const inngestFunctions = [fulfillVerifiedPaymentJob];
