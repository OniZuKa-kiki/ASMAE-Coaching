import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { friendlyErrors, toFriendlyError } from "@/lib/api-errors";
import {
  assertPaymentProviderAvailable,
  startPaymentFlow,
} from "@/lib/payments/checkout";
import {
  getDefaultProvider,
  isAnyPaymentProviderConfigured,
} from "@/lib/payments/config";
import type { PaymentProviderId } from "@/lib/payments/types";

export async function POST(request: NextRequest) {
  try {
    if (!isAnyPaymentProviderConfigured()) {
      return NextResponse.json(
        { error: friendlyErrors.purchaseUnavailable },
        { status: 503 }
      );
    }

    const user = await requireUser();
    const { slug, provider } = (await request.json()) as {
      slug?: string;
      provider?: PaymentProviderId;
    };

    const paymentProvider: PaymentProviderId =
      provider || getDefaultProvider();
    assertPaymentProviderAvailable(paymentProvider);

    if (!slug) {
      return NextResponse.json(
        { error: friendlyErrors.incomplete },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
    });
    if (!course) {
      return NextResponse.json(
        { error: "الدورة غير موجودة" },
        { status: 404 }
      );
    }

    const existing = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: friendlyErrors.alreadyOwned },
        { status: 409 }
      );
    }

    const result = await startPaymentFlow({
      provider: paymentProvider,
      type: "course",
      amountCentsEur: course.price,
      description: course.title,
      courseId: course.id,
      successPath: "/dashboard/courses",
      cancelPath: `/courses/${slug}`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const raw =
      error instanceof Error ? error.message : friendlyErrors.generic;
    const status = raw === "Non authentifié" ? 401 : 500;
    return NextResponse.json(
      { error: toFriendlyError(raw, status) },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: friendlyErrors.incomplete },
      { status: 400 }
    );
  }

  const fakeRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ slug }),
    headers: { "Content-Type": "application/json" },
  });

  const res = await POST(fakeRequest);
  const data = await res.json();

  if (!res.ok) return NextResponse.json(data, { status: res.status });
  if (data.url) return NextResponse.redirect(data.url);
  return NextResponse.json({ error: friendlyErrors.generic }, { status: 500 });
}
