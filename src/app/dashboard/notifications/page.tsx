import { NotificationList } from "@/components/dashboard/notification-list";
import { dashboardContent } from "@/lib/constants";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  syncUserNotifications,
} from "@/lib/notifications";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function DashboardNotificationsPage() {
  const user = await getOrCreateUser();
  if (!user) {
    return <p>جارٍ التحميل...</p>;
  }

  await syncUserNotifications(user.id);
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <div>
      <h1 className="page-header-title mb-2">الإشعارات</h1>
      <p className="text-text/70 mb-6">{dashboardContent.notifications.subtitle}</p>
      <NotificationList notifications={notifications} unreadCount={unreadCount} />
    </div>
  );
}
