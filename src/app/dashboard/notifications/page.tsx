import type { Metadata } from "next";
import { NotificationList } from "@/components/dashboard/notification-list";
import { getTranslations } from "next-intl/server";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  syncUserNotifications,
} from "@/lib/notifications";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/notifications",
    namespace: "dashboard.notifications",
    titleKey: "pageTitle",
    descriptionKey: "subtitle",
  });
}

export default async function DashboardNotificationsPage() {
  const [user, t, tCommon] = await Promise.all([
    getOrCreateUser(),
    getTranslations("dashboard.notifications"),
    getTranslations("common"),
  ]);

  if (!user) {
    return <p>{tCommon("loading")}</p>;
  }

  await syncUserNotifications(user.id);
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("pageTitle")}</h1>
      <p className="text-text/70 mb-6">{t("subtitle")}</p>
      <NotificationList notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
