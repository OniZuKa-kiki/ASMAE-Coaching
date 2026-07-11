import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  localeCookieMaxAge,
  localeCookieName,
  routing,
  type AppLocale,
} from "@/i18n/routing";
import {
  enabledLocalesCookieName,
  parseEnabledLocalesCookie,
} from "@/lib/locale-cookie";
import {
  getAdminBasePath,
  isAdminInternalPath,
  usesCustomAdminPath,
} from "@/lib/admin-path";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import arMessages from "../messages/ar.json";
import frMessages from "../messages/fr.json";

function localeFromRequest(req: Request): AppLocale {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${localeCookieName}=([^;]+)`));
  const value = match?.[1];
  if (value && routing.locales.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return routing.defaultLocale;
}

function rateLimitMessage(locale: AppLocale): string {
  return locale === "fr"
    ? frMessages.errors.rateLimited
    : arMessages.errors.rateLimited;
}

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

  const langParam = req.nextUrl.searchParams.get("lang");
  const enabledFromCookie = parseEnabledLocalesCookie(
    req.cookies.get(enabledLocalesCookieName)?.value
  ) ?? [routing.defaultLocale];
  if (
    langParam &&
    routing.locales.includes(langParam as AppLocale) &&
    enabledFromCookie.includes(langParam as AppLocale) &&
    !pathname.startsWith("/api")
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.searchParams.delete("lang");
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(localeCookieName, langParam, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
    });
    return response;
  }

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
      const locale = localeFromRequest(req);
      return NextResponse.json(
        { error: rateLimitMessage(locale) },
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
