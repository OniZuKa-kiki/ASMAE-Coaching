import { NextRequest, NextResponse } from "next/server";
import { recommendationClickSchema } from "@/lib/api-schemas";
import { getRequestFriendlyErrors } from "@/lib/action-locale";
import { recordRecommendationClick } from "@/lib/recommendation-clicks";
import { getOrCreateUser } from "@/lib/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const errors = await getRequestFriendlyErrors();
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: errors.unauthorized }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: errors.invalidData }, { status: 400 });
  }

  const parsed = recommendationClickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: errors.invalidData }, { status: 400 });
  }

  await recordRecommendationClick({
    userId: user.id,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    source: parsed.data.source,
    reasonKey: parsed.data.reasonKey,
  });

  return NextResponse.json({ ok: true });
}
