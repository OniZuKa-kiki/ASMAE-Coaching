import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
import { friendlyErrors } from "@/lib/api-errors";

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  message: z.string().min(10, "الرسالة قصيرة جداً"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: friendlyErrors.emailUnavailable },
        { status: 503 }
      );
    }

    await sendContactMessage(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: friendlyErrors.generic },
      { status: 500 }
    );
  }
}
