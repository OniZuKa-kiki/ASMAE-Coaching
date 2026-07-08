import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { getAvailableSlots } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const serviceSlug = request.nextUrl.searchParams.get("service");

  if (!date || !serviceSlug) {
    return NextResponse.json(
      { error: "Paramètres date et service requis" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(date, serviceSlug);

  return NextResponse.json({ date, serviceSlug, slots });
}
