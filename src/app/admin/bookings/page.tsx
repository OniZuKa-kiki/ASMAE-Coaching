import { adminUrl } from "@/lib/admin-path";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { adminErrors } from "@/lib/api-errors";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { slotKeyForStatus } from "@/lib/booking";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

const bookingStatusLabels: Record<(typeof bookingStatuses)[number], string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
};

async function updateBookingStatus(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const bookingId = String(formData.get("bookingId") || "");
  const status = String(formData.get("status") || "");
  if (!bookingId || !bookingStatuses.includes(status as (typeof bookingStatuses)[number])) {
    return incomplete("ar");
  }

  return runAction("ar", async () => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { date: true, startTime: true },
    });
    if (!booking) throw new Error(adminErrors.notFound);

    const dateStr = format(booking.date, "yyyy-MM-dd");
    const nextStatus = status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: nextStatus,
        slotKey: slotKeyForStatus(nextStatus, dateStr, booking.startTime),
      },
    });

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
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const status = getQueryValue(params.status).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status && bookingStatuses.includes(status as (typeof bookingStatuses)[number])
      ? { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" }
      : {}),
    ...(q
      ? {
          OR: [
            { user: { email: { contains: q, mode: "insensitive" as const } } },
            { user: { firstName: { contains: q, mode: "insensitive" as const } } },
            { user: { lastName: { contains: q, mode: "insensitive" as const } } },
            { service: { title: { contains: q, mode: "insensitive" as const } } },
          ],
        }
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

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: true,
      service: true,
      payment: true,
    },
    orderBy,
    take: 100,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">الحجوزات</h1>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-4 gap-4">
          <AdminFormField label="بحث" htmlFor="booking-filter-q">
            <Input
              id="booking-filter-q"
              name="q"
              defaultValue={q}
              placeholder="العميل، البريد أو الخدمة..."
              className="text-sm"
            />
          </AdminFormField>
          <AdminFormField label="حالة الحجز">
            <FilterSelect
              name="status"
              value={status}
              options={[
                { value: "", label: "جميع الحالات" },
                { value: "PENDING", label: "قيد الانتظار" },
                { value: "CONFIRMED", label: "مؤكد" },
                { value: "COMPLETED", label: "مكتمل" },
                { value: "CANCELLED", label: "ملغى" },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <FilterSelect
              name="sort"
              value={sort}
              options={[
                { value: "created_desc", label: "الأحدث" },
                { value: "created_asc", label: "الأقدم" },
                { value: "date_asc", label: "تاريخ الجلسة ↑" },
                { value: "date_desc", label: "تاريخ الجلسة ↓" },
              ]}
            />
          </AdminFormField>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors w-full"
            >
              تصفية
            </button>
          </div>
        </form>
      </Card>
      {bookings.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد حجوزات حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="font-semibold text-heading">{booking.service.title}</p>
                  <p className="text-sm text-text/70">
                    {booking.user.firstName || "عميل"} {booking.user.lastName || ""} —{" "}
                    {booking.user.email}
                  </p>
                  <p className="text-sm text-text/70">
                    {formatDate(booking.date)} في {booking.startTime}
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    الدفع: {booking.payment?.status || "لا يوجد"}
                  </p>
                </div>

                <ActionForm
                  action={updateBookingStatus}
                  locale="ar"
                  className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-2 w-full lg:w-auto"
                >
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <AdminFormField
                    label="تحديث الحالة"
                    htmlFor={`booking-status-${booking.id}`}
                    className="w-full sm:w-auto"
                  >
                    <select
                      id={`booking-status-${booking.id}`}
                      name="status"
                      defaultValue={booking.status}
                      className="w-full sm:w-auto rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-heading"
                    >
                      {bookingStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {bookingStatusLabels[statusOption]}
                        </option>
                      ))}
                    </select>
                  </AdminFormField>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    تحديث
                  </button>
                </ActionForm>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
