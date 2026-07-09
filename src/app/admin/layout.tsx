import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTwoFactorGate } from "@/components/admin/two-factor-gate";
import { PanelMobileHeader } from "@/components/layout/panel-mobile-header";
import { getUserRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const user = await currentUser();
  const twoFactorRequired = process.env.ADMIN_REQUIRE_2FA === "true";
  if (twoFactorRequired && user && !user.twoFactorEnabled) {
    return (
      <div
        dir="rtl"
        lang="ar"
        className="flex min-h-screen flex-col bg-background overflow-x-hidden"
        suppressHydrationWarning
      >
        <PanelMobileHeader variant="admin" homeLabel="عرض الموقع" />
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">
          <AdminTwoFactorGate />
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen bg-background"
      suppressHydrationWarning
    >
      <PanelMobileHeader variant="admin" homeLabel="عرض الموقع" />
      <AdminSidebar />
      <div className="min-w-0 p-4 sm:p-6 lg:p-10 lg:ps-72">{children}</div>
    </div>
  );
}
