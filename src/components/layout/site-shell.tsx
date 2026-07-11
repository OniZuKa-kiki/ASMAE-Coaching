"use client";

import { usePathname } from "next/navigation";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { PublicContact } from "@/lib/contact-info";
import { getAdminBasePath, isAdminPublicPath } from "@/lib/admin-path";

const baseNoShellRoutes = ["/dashboard", "/sign-in", "/sign-up"];

export function SiteShell({
  children,
  contact,
}: {
  children: React.ReactNode;
  contact: PublicContact;
}) {
  const pathname = usePathname();
  const noShellRoutes = [...baseNoShellRoutes, getAdminBasePath()];
  const hideShell =
    noShellRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) || isAdminPublicPath(pathname);

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      <Footer contact={contact} />
      <CookieConsentBanner />
    </>
  );
}
