import { NextResponse } from "next/server";
import { getAvailableProviders } from "@/lib/payments/config";

export async function GET() {
  const providers = getAvailableProviders();
  return NextResponse.json({ providers });
}
