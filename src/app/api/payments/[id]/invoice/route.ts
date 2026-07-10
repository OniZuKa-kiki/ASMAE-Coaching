import { NextRequest, NextResponse } from "next/server";
import { buildInvoiceHtmlForPayment, buildInvoicePdfForPayment } from "@/lib/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function invoiceErrorResponse(error: string) {
  const status =
    error === "unauthorized"
      ? 401
      : error === "forbidden"
      ? 403
      : error === "not_paid"
      ? 400
      : 404;

  const messages: Record<string, string> = {
    unauthorized: "يرجى تسجيل الدخول.",
    forbidden: "غير مصرح.",
    not_paid: "الفاتورة متاحة للمدفوعات المؤكدة فقط.",
    not_found: "الدفعة غير موجودة.",
  };

  return NextResponse.json(
    { error: messages[error] ?? "خطأ" },
    { status }
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const download = request.nextUrl.searchParams.get("download") === "1";

    if (download) {
      const result = await buildInvoicePdfForPayment(id);
      if ("error" in result) {
        return invoiceErrorResponse(result.error);
      }

      return new NextResponse(Buffer.from(result.pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const result = await buildInvoiceHtmlForPayment(id);
    if ("error" in result) {
      return invoiceErrorResponse(result.error);
    }

    return new NextResponse(result.html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "تعذّر إنشاء الفاتورة." },
      { status: 500 }
    );
  }
}
