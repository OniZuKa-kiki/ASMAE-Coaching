import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { PanelMobileHeader } from "@/components/layout/panel-mobile-header";
import {
  getUnreadNotificationCount,
  syncUserNotifications,
} from "@/lib/notifications";
import { getOrCreateUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();
  let unreadNotifications = 0;

  if (user) {
    await syncUserNotifications(user.id);
    unreadNotifications = await getUnreadNotificationCount(user.id);
  }

  // Auth protégée par le middleware uniquement — pas de redirect ici
  // (évite la course auth() intermittente → boucle /sign-in ↔ /dashboard)
  return (
    <div className="min-h-screen overflow-x-hidden bg-background" suppressHydrationWarning>
      <PanelMobileHeader
        variant="dashboard"
        unreadNotifications={unreadNotifications}
      />
      <DashboardSidebar unreadNotifications={unreadNotifications} />
      <div
        className="min-w-0 p-4 sm:p-6 lg:p-10 lg:ps-72"
        suppressHydrationWarning
      >
        {children}
      </div>
    </div>
  );
}
