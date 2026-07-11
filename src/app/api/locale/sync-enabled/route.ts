import { NextResponse } from "next/server";
import {
  getEnabledLocales,
  syncEnabledLocalesCookie,
} from "@/lib/locale-settings";

export const dynamic = "force-dynamic";

export async function POST() {
  const enabled = await getEnabledLocales();
  await syncEnabledLocalesCookie(enabled);
  return NextResponse.json({ ok: true, enabled });
}
