import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  handleClerkEmailCreated,
  type ClerkEmailCreatedPayload,
} from "@/lib/clerk-auth-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClerkWebhookEvent = {
  type: string;
  data: ClerkEmailCreatedPayload;
};

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SIGNING_SECRET non configuré" },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "En-têtes Svix manquants" }, { status: 400 });
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type !== "email.created") {
    return NextResponse.json({ received: true, skipped: event.type });
  }

  try {
    const result = await handleClerkEmailCreated(event.data);
    if (!result.handled) {
      console.warn(
        "[clerk-webhook] email.created non géré:",
        result.reason,
        JSON.stringify({
          slug: event.data.slug,
          to:
            event.data.to_email_address ?? event.data.email_address ?? null,
        })
      );
    } else {
      console.info(
        "[clerk-webhook] email envoyé via Resend:",
        event.data.slug,
        event.data.to_email_address ?? event.data.email_address
      );
    }
    return NextResponse.json({
      received: true,
      handled: result.handled,
      reason: result.reason ?? null,
    });
  } catch (error) {
    console.error("[clerk-webhook]", error);
    return NextResponse.json(
      {
        error: "Échec envoi email Clerk",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
