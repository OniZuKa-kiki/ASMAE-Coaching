"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { Card } from "@/components/ui/card";
import { dashboardContent } from "@/lib/constants";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notification-actions";
import type { NotificationItem } from "@/lib/notifications";
import { cn, formatDate } from "@/lib/utils";

const content = dashboardContent.notifications;

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

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");
  const [isPending, startTransition] = useTransition();

  const query = normalizeSearch(search);

  const filteredNotifications = useMemo(() => {
    let items = notifications.filter((notification) => {
      if (status === "unread" && notification.readAt) return false;
      if (status === "read" && !notification.readAt) return false;
      if (type !== "all" && notification.type !== type) return false;

      if (!query) return true;
      const haystack = `${notification.title} ${notification.body ?? ""}`.toLowerCase();
      return haystack.includes(query);
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

  return (
    <div className="space-y-6">
      {unreadCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text/70">{content.unreadCount(unreadCount)}</p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
          >
            {content.markAllRead}
          </button>
        </div>
      ) : null}

      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={content.searchPlaceholder}
        filters={[
          {
            id: "status",
            label: content.statusLabel,
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: content.statusAll },
              { value: "unread", label: content.statusUnread },
              { value: "read", label: content.statusRead },
            ],
          },
          {
            id: "type",
            label: content.typeLabel,
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: content.typeAll },
              ...notificationTypes.map((value) => ({
                value,
                label: content.types[value],
              })),
            ],
          },
          {
            id: "sort",
            label: content.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "recent", label: content.sortRecent },
              { value: "oldest", label: content.sortOldest },
            ],
          },
        ]}
        resultsCount={filteredNotifications.length}
        resultsLabel={content.resultsCount(filteredNotifications.length)}
      />

      {filteredNotifications.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">
            {notifications.length === 0 ? content.empty : content.noResults}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
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
                        {content.types[notification.type]}
                      </span>
                      {isUnread ? (
                        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                          {content.statusUnread}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-semibold text-heading">{notification.title}</h3>
                    {notification.body ? (
                      <p className="mt-1 text-sm text-text/70">{notification.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-text/50">
                      {formatDate(new Date(notification.createdAt))}
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
                        {content.open}
                      </Link>
                    ) : null}
                    {isUnread ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={isPending}
                        className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                      >
                        {content.markRead}
                      </button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
