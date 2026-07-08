"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const noShellRoutes = ["/dashboard", "/admin", "/sign-in", "/sign-up"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideShell = noShellRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
