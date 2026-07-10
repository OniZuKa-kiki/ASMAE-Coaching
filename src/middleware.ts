import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getAdminBasePath,
  isAdminInternalPath,
  usesCustomAdminPath,
} from "@/lib/admin-path";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";

const adminBase = getAdminBasePath();
const customAdmin = usesCustomAdminPath();

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isPublicAdminRoute = createRouteMatcher([`${adminBase}(.*)`]);
const isLegacyAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAuthApiRoute = createRouteMatcher([
  "/api/booking/checkout",
  "/api/checkout/course",
]);
const isContactApiRoute = createRouteMatcher(["/api/contact"]);
const isInvoiceApiRoute = createRouteMatcher([
  "/api/payments/sample/invoice",
  "/api/payments/:id/invoice",
]);

function getAdminRole(
  sessionClaims: Record<string, unknown> | null | undefined
): string | undefined {
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const publicMetadata = sessionClaims?.publicMetadata as
    | { role?: string }
    | undefined;
  return metadata?.role || publicMetadata?.role;
}


export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (customAdmin && isLegacyAdminRoute(req)) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  if (
    customAdmin &&
    (pathname === adminBase || pathname.startsWith(`${adminBase}/`))
  ) {
    const internalPath =
      pathname === adminBase
        ? "/admin"
        : `/admin${pathname.slice(adminBase.length)}`;
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isContactApiRoute(req) && req.method === "POST") {
    const ip = getClientIp(req);
    const limited = rateLimit(`contact:${ip}`, 10, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "طلبات كثيرة. حاول مجدداً بعد قليل." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }
  }

  const needsAuth =
    isDashboardRoute(req) ||
    isPublicAdminRoute(req) ||
    (customAdmin && isAdminInternalPath(pathname)) ||
    (!customAdmin && isLegacyAdminRoute(req)) ||
    isAuthApiRoute(req) ||
    isInvoiceApiRoute(req);

  if (needsAuth) {
    await auth.protect();
  }

  const { userId, sessionClaims } = await auth();

  if (isAuthPage(req) && userId) {
    const redirectUrl = getSafeRedirectUrl(
      req.nextUrl.searchParams.get("redirect_url")
    );
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  const isAdminArea =
    isPublicAdminRoute(req) ||
    (!customAdmin && isLegacyAdminRoute(req)) ||
    (customAdmin && isAdminInternalPath(pathname));

  if (isAdminArea) {
    if (userId && getAdminRole(sessionClaims as Record<string, unknown>) !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
