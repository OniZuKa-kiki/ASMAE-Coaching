import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import {
  getPodcastIdBySlug,
  getPodcastProgressBySlug,
  upsertPodcastProgress,
} from "@/lib/podcast-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "يرجى تسجيل الدخول." }, { status: 401 });
  }

  const { slug } = await context.params;
  const progress = await getPodcastProgressBySlug(slug, user.id);
  if (!progress) {
    return NextResponse.json({ progress: null });
  }

  return NextResponse.json({
    progress: {
      positionSeconds: progress.positionSeconds,
      durationSeconds: progress.durationSeconds,
    },
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "يرجى تسجيل الدخول." }, { status: 401 });
  }

  const { slug } = await context.params;
  const podcast = await getPodcastIdBySlug(slug);
  if (!podcast?.isPublished) {
    return NextResponse.json({ error: "الحلقة غير موجودة." }, { status: 404 });
  }

  let body: { positionSeconds?: number; durationSeconds?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة." }, { status: 400 });
  }

  const positionSeconds = Number(body.positionSeconds);
  const durationSeconds = Number(body.durationSeconds);
  if (!Number.isFinite(positionSeconds) || !Number.isFinite(durationSeconds)) {
    return NextResponse.json({ error: "بيانات غير صالحة." }, { status: 400 });
  }

  await upsertPodcastProgress({
    userId: user.id,
    podcastId: podcast.id,
    positionSeconds,
    durationSeconds,
  });

  return NextResponse.json({ ok: true });
}
