import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { adminUrl } from "@/lib/admin-path";
import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { formatAdminUserRole, getAdminFilters } from "@/lib/admin-i18n";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import { adminListLimits } from "@/lib/admin-filters";
import type { AppLocale } from "@/i18n/routing";

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
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tRoles, tFields, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.users"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.roles"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

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
    take: adminListLimits.users,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>
      <AdminFilterCard title={filters.users.title}>
        <AdminFormField label={filters.search} htmlFor="user-filter-q">
          <Input
            id="user-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.users.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={tFields("role")}>
          <FilterSelect
            name="role"
            value={role}
            options={[
              { value: "", label: tFilters("allRoles") },
              { value: "CLIENT", label: tRoles("CLIENT") },
              { value: "ADMIN", label: tRoles("ADMIN") },
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
              { value: "email_asc", label: filters.sortEmailAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>
      {users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">{tEmpty("noUsers")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">
                    {user.firstName || ""} {user.lastName || ""}{" "}
                    {!user.firstName && !user.lastName
                      ? tMisc("clientFallback")
                      : ""}
                  </p>
                  <p className="text-sm text-text/70">{user.email}</p>
                  <p className="text-xs text-text/60">
                    {tMisc("registeredAt", {
                      date: formatDate(user.createdAt, locale),
                    })}{" "}
                    •{" "}
                    {tMisc("roleLabel", {
                      role: formatAdminUserRole(user.role, locale),
                    })}
                  </p>
                </div>
                <div className="text-sm text-text/70">
                  <p>
                    {tMisc("bookingsTotal", { count: user._count.bookings })}
                  </p>
                  <p>
                    {tMisc("enrollmentsTotal", {
                      count: user._count.enrollments,
                    })}
                  </p>
                  <p>
                    {tMisc("paymentsTotal", { count: user._count.payments })}
                  </p>
                  {user.intakeForms[0] ? (
                    <Link
                      href={adminUrl(
                        `/settings/intake-forms?q=${encodeURIComponent(user.email)}`
                      )}
                      className="inline-block mt-2 text-primary font-medium hover:underline"
                    >
                      {tActions("viewIntake", {
                        date: formatDate(user.intakeForms[0].createdAt, locale),
                      })}
                    </Link>
                  ) : (
                    <p className="mt-2 text-text/50">
                      {tMisc("intakeIncomplete")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={users.length}
            limit={adminListLimits.users}
          />
        </div>
      )}
    </div>
  );
}
