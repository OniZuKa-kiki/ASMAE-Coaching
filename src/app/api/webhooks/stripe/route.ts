import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { paymentService } from "@/lib/payments/payment-service";
import { fulfillVerifiedPayment } from "@/lib/payments/fulfillment";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const verified = await paymentService.verifyPayment("stripe", session.id);
    if (verified) {
      await fulfillVerifiedPayment(verified);
    }
  }

  return NextResponse.json({ received: true });
}
