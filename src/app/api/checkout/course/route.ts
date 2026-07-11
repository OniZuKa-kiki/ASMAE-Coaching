import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { courseCheckoutSchema } from "@/lib/api-schemas";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { toFriendlyError } from "@/lib/api-errors";
import { getRequestFriendlyErrors } from "@/lib/action-locale";
import {
  assertPaymentProviderAvailable,
  startPaymentFlow,
} from "@/lib/payments/checkout";
import {
  getDefaultProvider,
  isAnyPaymentProviderConfigured,
} from "@/lib/payments/config";
import type { PaymentProviderId } from "@/lib/payments/types";
import { getRequestLocale } from "@/lib/request-locale";

export async function POST(request: NextRequest) {
  const locale = await getRequestLocale();
  const errors = await getRequestFriendlyErrors();

  try {
    if (!isAnyPaymentProviderConfigured()) {
      return NextResponse.json(
        { error: errors.purchaseUnavailable },
        { status: 503 }
      );
    }

    const user = await requireUser();
    const { slug, provider } = courseCheckoutSchema.parse(await request.json());

    const paymentProvider: PaymentProviderId =
      (provider as PaymentProviderId | undefined) || getDefaultProvider();
    assertPaymentProviderAvailable(paymentProvider);

    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
    });
    if (!course) {
      return NextResponse.json(
        { error: errors.courseNotFound },
        { status: 404 }
      );
    }

    const existing = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: errors.alreadyOwned },
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
      cancelPath: `/booking/cancel?from=course&slug=${slug}`,
    });

    auditLog({
      action: "course.checkout_started",
      actorId: user.id,
      actorEmail: user.email,
      target: course.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: errors.incomplete },
        { status: 400 }
      );
    }
    const raw =
      error instanceof Error ? error.message : errors.generic;
    const status = raw === "Non authentifié" ? 401 : 500;
    return NextResponse.json(
      { error: toFriendlyError(raw, status, locale) },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  const errors = await getRequestFriendlyErrors();
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { error: errors.incomplete },
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
  return NextResponse.json({ error: errors.generic }, { status: 500 });
}
