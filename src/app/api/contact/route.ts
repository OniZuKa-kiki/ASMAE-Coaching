import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema } from "@/lib/api-schemas";
import { auditLog } from "@/lib/audit-log";
import { sendContactMessage } from "@/lib/email";
import { friendlyErrors } from "@/lib/api-errors";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    const turnstileOk = await verifyTurnstileToken(data.turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "فشل التحقق الأمني. حاول مجدداً." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: friendlyErrors.emailUnavailable },
        { status: 503 }
      );
    }

    await sendContactMessage({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    auditLog({
      action: "contact.message_sent",
      meta: { emailDomain: data.email.split("@")[1] ?? "unknown" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[contact]", message);
    return NextResponse.json(
      { error: friendlyErrors.emailUnavailable },
      { status: 500 }
    );
  }
}
