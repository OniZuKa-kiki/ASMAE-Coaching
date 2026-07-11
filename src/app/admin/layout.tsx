import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTwoFactorGate } from "@/components/admin/two-factor-gate";
import { PanelMobileHeader } from "@/components/layout/panel-mobile-header";
import { getUserRole } from "@/lib/auth";
import type { AppLocale } from "@/i18n/routing";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const user = await currentUser();
  const twoFactorRequired = process.env.ADMIN_REQUIRE_2FA === "true";
  if (twoFactorRequired && user && !user.twoFactorEnabled) {
    return (
      <div
        dir={dir}
        lang={locale}
        className="flex min-h-screen flex-col overflow-x-hidden bg-background"
        suppressHydrationWarning
      >
        <PanelMobileHeader variant="admin" />
        <div className="panel-content min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <AdminTwoFactorGate />
        </div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      lang={locale}
      className="min-h-screen overflow-x-hidden bg-background"
      suppressHydrationWarning
    >
      <PanelMobileHeader variant="admin" />
      <AdminSidebar />
      <div
        className="panel-content min-w-0 p-4 sm:p-6 lg:p-10 lg:ps-72"
        suppressHydrationWarning
      >
        {children}
      </div>
    </div>
  );
}
