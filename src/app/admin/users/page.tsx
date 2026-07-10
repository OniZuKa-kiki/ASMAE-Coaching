import { adminUrl } from "@/lib/admin-path";
import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, formatUserRole } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { adminFilterLabels } from "@/lib/admin-filters";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const role = getQueryValue(params.role).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(role === "ADMIN" || role === "CLIENT"
      ? { role: role as "ADMIN" | "CLIENT" }
      : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "created_asc"
      ? ({ createdAt: "asc" } as const)
      : sort === "email_asc"
      ? ({ email: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const users = await prisma.user.findMany({
    where,
    include: {
      intakeForms: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, createdAt: true },
      },
      _count: {
        select: {
          bookings: true,
          enrollments: true,
          payments: true,
        },
      },
    },
    orderBy,
    take: 100,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">العملاء</h1>
      <AdminFilterCard title={adminFilterLabels.users.title}>
        <AdminFormField label={adminFilterLabels.search} htmlFor="user-filter-q">
          <Input
            id="user-filter-q"
            name="q"
            defaultValue={q}
            placeholder={adminFilterLabels.users.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label="الدور">
          <FilterSelect
            name="role"
            value={role}
            options={[
              { value: "", label: "جميع الأدوار" },
              { value: "CLIENT", label: "العميلة" },
              { value: "ADMIN", label: "مدير النظام" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={adminFilterLabels.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: adminFilterLabels.sortNewest },
              { value: "created_asc", label: adminFilterLabels.sortOldest },
              { value: "email_asc", label: "البريد أ→ي" },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>
      {users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا يوجد عملاء حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">
                    {user.firstName || ""} {user.lastName || ""}{" "}
                    {!user.firstName && !user.lastName ? "عميلة" : ""}
                  </p>
                  <p className="text-sm text-text/70">{user.email}</p>
                  <p className="text-xs text-text/60">
                    تاريخ التسجيل: {formatDate(user.createdAt)} • الدور:{" "}
                    {formatUserRole(user.role)}
                  </p>
                </div>
                <div className="text-sm text-text/70">
                  <p>عدد الحجوزات: {user._count.bookings}</p>
                  <p>الدورات المسجل بها: {user._count.enrollments}</p>
                  <p>المدفوعات: {user._count.payments}</p>
                  {user.intakeForms[0] ? (
                    <Link
                      href={adminUrl(`/settings/intake-forms?q=${encodeURIComponent(user.email)}`)}
                      className="inline-block mt-2 text-primary font-medium hover:underline"
                    >
                      عرض الاستبيان ({formatDate(user.intakeForms[0].createdAt)})
                    </Link>
                  ) : (
                    <p className="mt-2 text-text/50">لم يُكمل الاستبيان بعد</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
