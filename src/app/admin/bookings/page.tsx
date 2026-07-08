import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { slotKeyForStatus } from "@/lib/booking";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

async function updateBookingStatus(formData: FormData) {
  "use server";

  const role = await getUserRole();
  if (role !== "admin") return;

  const bookingId = String(formData.get("bookingId") || "");
  const status = String(formData.get("status") || "");
  if (!bookingId || !bookingStatuses.includes(status as (typeof bookingStatuses)[number])) {
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { date: true, startTime: true },
  });
  if (!booking) return;

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
      <h1 className="page-header-title mb-6 sm:mb-8">
        Réservations
      </h1>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher client, email, service..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: "Tous statuts" },
              ...bookingStatuses.map((s) => ({ value: s, label: s })),
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récents" },
              { value: "created_asc", label: "Plus anciens" },
              { value: "date_asc", label: "Date séance ↑" },
              { value: "date_desc", label: "Date séance ↓" },
            ]}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Filtrer
          </button>
        </form>
      </Card>
      {bookings.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucune réservation pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <p className="font-semibold text-heading">{booking.service.title}</p>
                  <p className="text-sm text-text/70">
                    {booking.user.firstName || "Client"} {booking.user.lastName || ""} —{" "}
                    {booking.user.email}
                  </p>
                  <p className="text-sm text-text/70">
                    {formatDate(booking.date)} à {booking.startTime}
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    Paiement: {booking.payment?.status || "Aucun"}
                  </p>
                </div>

                <form action={updateBookingStatus} className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <select
                    name="status"
                    defaultValue={booking.status}
                    className="w-full sm:w-auto rounded-full border border-border bg-card px-4 py-2 text-sm text-heading"
                  >
                    {bookingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    Mettre à jour
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
