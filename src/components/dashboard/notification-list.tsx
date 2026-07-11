"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notification-actions";
import type { NotificationItem } from "@/lib/notifications";
import type { AppLocale } from "@/i18n/routing";
import { matchesArabicSearch } from "@/lib/search-utils";
import { cn, formatDate } from "@/lib/utils";

const notificationTypes = [
  "BOOKING_CONFIRMED",
  "BOOKING_REMINDER",
  "SESSION_REVIEW",
  "COURSE_PURCHASE",
  "GOAL_DEADLINE",
  "PODCAST_CONTINUE",
  "SYSTEM",
] as const;

type NotificationListProps = {
  notifications: NotificationItem[];
  unreadCount: number;
};

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.notifications");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");
  const [isPending, startTransition] = useTransition();

  const query = search.trim();

  const filteredNotifications = useMemo(() => {
    let items = notifications.filter((notification) => {
      if (status === "unread" && notification.readAt) return false;
      if (status === "read" && !notification.readAt) return false;
      if (type !== "all" && notification.type !== type) return false;

      if (!query) return true;
      const haystack = `${notification.title} ${notification.body ?? ""}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    switch (sort) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [notifications, status, type, query, sort]);

  function handleMarkRead(notificationId: string) {
    startTransition(async () => {
      await markNotificationReadAction(notificationId);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  }

  const unreadLabel =
    unreadCount === 1
      ? t("unreadOne")
      : t("unreadMany", { count: unreadCount });

  const resultsLabel =
    filteredNotifications.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: filteredNotifications.length });

  return (
    <div className="space-y-6">
      {unreadCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text/70">{unreadLabel}</p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
          >
            {t("markAllRead")}
          </button>
        </div>
      ) : null}

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            id: "status",
            label: t("statusLabel"),
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: t("statusAll") },
              { value: "unread", label: t("statusUnread") },
              { value: "read", label: t("statusRead") },
            ],
          },
          {
            id: "type",
            label: t("typeLabel"),
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: t("typeAll") },
              ...notificationTypes.map((value) => ({
                value,
                label: t(`types.${value}`),
              })),
            ],
          },
          {
            id: "sort",
            label: t("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "recent", label: t("sortRecent") },
              { value: "oldest", label: t("sortOldest") },
            ],
          },
        ]}
        resultsCount={filteredNotifications.length}
        resultsLabel={resultsLabel}
      />

      <ListScrollHint
        count={filteredNotifications.length}
        className="mb-3 text-end sm:text-start"
      />

      {filteredNotifications.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">
            {notifications.length === 0 ? t("empty") : t("noResults")}
          </p>
        </Card>
      ) : (
        <ScrollableItemList count={filteredNotifications.length}>
          {filteredNotifications.map((notification) => {
            const isUnread = !notification.readAt;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  isUnread && "border-primary/30 bg-primary/[0.03]"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {t(`types.${notification.type}`)}
                      </span>
                      {isUnread ? (
                        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                          {t("statusUnread")}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-semibold text-heading">{notification.title}</h3>
                    {notification.body ? (
                      <p className="mt-1 text-sm text-text/70">{notification.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-text/50">
                      {formatDate(new Date(notification.createdAt), locale)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {notification.href ? (
                      <Link
                        href={notification.href}
                        onClick={() => {
                          if (isUnread) handleMarkRead(notification.id);
                        }}
                        className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                      >
                        {t("open")}
                      </Link>
                    ) : null}
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={isPending}
                        className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                      >
                        {t("markRead")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </ScrollableItemList>
      )}
    </div>
  );
}
