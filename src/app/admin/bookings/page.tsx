import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getActionLocale } from "@/lib/action-locale";
import { getAdminFilters } from "@/lib/admin-i18n";
import { prisma } from "@/lib/db";
import { slotKeyForStatus } from "@/lib/booking";
import { formatDate } from "@/lib/utils";
import { notifySessionReview } from "@/lib/notifications";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import { adminListLimits } from "@/lib/admin-filters";
import { filterByArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

async function updateBookingStatus(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const bookingId = String(formData.get("bookingId") || "");
  const status = String(formData.get("status") || "");
  if (!bookingId || !bookingStatuses.includes(status as (typeof bookingStatuses)[number])) {
    return incomplete(locale);
  }

  return runAction(locale, async () => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        date: true,
        startTime: true,
        userId: true,
        service: { select: { title: true } },
      },
    });
    if (!booking) throw new Error("NOT_FOUND");

    const dateStr = format(booking.date, "yyyy-MM-dd");
    const nextStatus = status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: nextStatus,
        slotKey: slotKeyForStatus(nextStatus, dateStr, booking.startTime),
      },
    });

    if (nextStatus === "COMPLETED") {
      await notifySessionReview({
        userId: booking.userId,
        bookingId,
        serviceTitle: booking.service.title,
      });
    }

    revalidatePath("/admin/bookings");
  }, "updated");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tStatuses, tPaymentStatuses, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.bookings"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.statuses.booking"),
      getTranslations("adminPages.statuses.payment"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const status = getQueryValue(params.status).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status && bookingStatuses.includes(status as (typeof bookingStatuses)[number])
      ? { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" }
      : {}),
  };

  const orderBy =
    sort === "created_asc"
      ? ({ createdAt: "asc" } as const)
      : sort === "date_asc"
      ? ({ date: "asc" } as const)
      : sort === "date_desc"
      ? ({ date: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const bookingsRaw = await prisma.booking.findMany({
    where,
    include: {
      user: true,
      service: true,
      payment: true,
      review: true,
    },
    orderBy,
  });

  const bookings = (
    q
      ? filterByArabicSearch(bookingsRaw, q, [
          (booking) => booking.user.email,
          (booking) => booking.user.firstName,
          (booking) => booking.user.lastName,
          (booking) => booking.service.title,
        ])
      : bookingsRaw
  ).slice(0, adminListLimits.bookings);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>
      <AdminFilterCard title={filters.bookings.title}>
        <AdminFormField label={filters.search} htmlFor="booking-filter-q">
          <Input
            id="booking-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.bookings.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={t("statusFilter")}>
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: tFilters("allStatuses") },
              ...bookingStatuses.map((statusOption) => ({
                value: statusOption,
                label: tStatuses(statusOption),
              })),
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "created_asc", label: filters.sortOldest },
              { value: "date_asc", label: filters.sortSessionDateAsc },
              { value: "date_desc", label: filters.sortSessionDateDesc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>
      {bookings.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">{tEmpty("noBookings")}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="font-semibold text-heading">{booking.service.title}</p>
                  <p className="text-sm text-text/70">
                    {booking.user.firstName || tMisc("clientFallback")}{" "}
                    {booking.user.lastName || ""} — {booking.user.email}
                  </p>
                  <p className="text-sm text-text/70">
                    {formatDate(booking.date, locale)}{" "}
                    {tMisc("atTime", { time: booking.startTime })}
                  </p>
                  {booking.notes ? (
                    <p className="text-sm text-text/80 mt-2 rounded-xl bg-muted/50 px-3 py-2">
                      {booking.notes}
                    </p>
                  ) : null}
                  {booking.review ? (
                    <div className="mt-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2">
                      <p className="text-xs font-semibold text-heading">
                        {t("sessionReview")}
                      </p>
                      <div className="mt-1 flex items-center gap-0.5">
                        {Array.from({ length: booking.review.rating }).map(
                          (_, index) => (
                            <Star
                              key={index}
                              className="h-3.5 w-3.5 fill-accent text-accent"
                            />
                          )
                        )}
                      </div>
                      {booking.review.comment ? (
                        <p className="mt-2 text-sm text-text/80">
                          {booking.review.comment}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="text-xs text-text/60 mt-1">
                    {t("paymentLabel", {
                      status: booking.payment?.status
                        ? tPaymentStatuses(booking.payment.status)
                        : tMisc("noPayment"),
                    })}
                  </p>
                </div>

                <ActionForm
                  action={updateBookingStatus}
                  locale={locale}
                  className="w-full lg:w-auto shrink-0"
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <AdminFormField
                    label={t("updateStatus")}
                    htmlFor={`booking-status-${booking.id}`}
                    className="w-full lg:min-w-[220px]"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <FilterSelect
                        name="status"
                        value={booking.status}
                        className="relative min-w-0 flex-1"
                        options={bookingStatuses.map((statusOption) => ({
                          value: statusOption,
                          label: tStatuses(statusOption),
                        }))}
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto shrink-0 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                      >
                        {tActions("update")}
                      </button>
                    </div>
                  </AdminFormField>
                </ActionForm>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={bookings.length}
            limit={adminListLimits.bookings}
          />
        </div>
      )}
    </div>
  );
}
