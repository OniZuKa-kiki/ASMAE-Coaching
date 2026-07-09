import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PanelMobileHeader } from "@/components/layout/panel-mobile-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <PanelMobileHeader variant="dashboard" homeLabel="الرئيسية" />
      <DashboardSidebar />
      <div className="min-w-0 p-4 sm:p-6 lg:p-10 lg:ps-72">{children}</div>
    </div>
  );
}