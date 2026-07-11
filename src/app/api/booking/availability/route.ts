import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { availabilityQuerySchema } from "@/lib/api-schemas";
import { getRequestFriendlyErrors } from "@/lib/action-locale";
import { getAvailableSlots } from "@/lib/booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const errors = await getRequestFriendlyErrors();

  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`availability:${ip}`, 60, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: errors.generic },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const parsed = availabilityQuerySchema.parse({
      date: request.nextUrl.searchParams.get("date"),
      service: request.nextUrl.searchParams.get("service"),
    });

    const slots = await getAvailableSlots(parsed.date, parsed.service);
    return NextResponse.json({
      date: parsed.date,
      serviceSlug: parsed.service,
      slots,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: errors.incomplete },
        { status: 400 }
      );
    }
    console.error("[availability]", error);
    return NextResponse.json(
      { error: errors.generic },
      { status: 500 }
    );
  }
}
