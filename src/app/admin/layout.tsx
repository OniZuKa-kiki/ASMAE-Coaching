import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
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

  return (
    <div dir="ltr" lang="fr" className="flex min-h-screen flex-col lg:flex-row bg-background overflow-x-hidden" suppressHydrationWarning>
      <PanelMobileHeader variant="admin" homeLabel="Voir le site" />
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">{children}</div>
    </div>
  );
}