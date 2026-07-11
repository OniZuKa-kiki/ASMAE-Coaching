import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/auth";
import { getRequestFriendlyErrors } from "@/lib/action-locale";
import { buildSampleInvoiceHtml, buildSampleInvoicePdf } from "@/lib/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const errors = await getRequestFriendlyErrors();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: errors.unauthorized }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: errors.forbidden }, { status: 403 });
    }

    const download = request.nextUrl.searchParams.get("download") === "1";

    if (download) {
      const { pdfBytes, filename } = await buildSampleInvoicePdf();

      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const { html } = await buildSampleInvoiceHtml();

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: errors.sampleInvoiceGenerateFailed },
      { status: 500 }
    );
  }
}
