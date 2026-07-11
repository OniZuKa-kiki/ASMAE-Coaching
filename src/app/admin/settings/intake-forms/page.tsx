import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { ScrollableItemList } from "@/components/ui/scalable-list";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { getAdminFilters } from "@/lib/admin-i18n";
import { adminListLimits } from "@/lib/admin-filters";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminIntakeFormsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [params, t, tCommon, tMisc] = await Promise.all([
    searchParams,
    getTranslations("adminPages.settings.intakeForms"),
    getTranslations("admin.common"),
    getTranslations("adminPages.misc"),
  ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const sort = getQueryValue(params.sort, "newest");

  const where = q
    ? {
        user: {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
          ],
        },
      }
    : undefined;

  const orderBy =
    sort === "oldest"
      ? ({ createdAt: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const forms = await prisma.intakeForm.findMany({
    where,
    include: { user: true },
    orderBy,
    take: adminListLimits.intakeForms,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("title")}</h1>
          <p className="mt-1 text-sm text-text/70">{t("subtitle")}</p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <AdminFilterCard
        title={filters.intakeForms.title}
        formClassName="grid gap-4 md:grid-cols-3"
      >
        <AdminFormField label={filters.search} htmlFor="intake-filter-q">
          <Input
            id="intake-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.intakeForms.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "newest", label: filters.sortNewest },
              { value: "oldest", label: filters.sortOldest },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {forms.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{t("noForms")}</p>
        </Card>
      ) : (
        <ScrollableItemList
          count={forms.length}
          stackGapClassName="space-y-4"
          maxHeightClassName="max-h-[32rem] sm:max-h-[36rem]"
        >
          {forms.map((form) => {
            const fullName = `${form.user.firstName ?? ""} ${form.user.lastName ?? ""}`.trim();
            return (
              <Card key={form.id}>
                <div className="mb-4">
                  <p className="font-semibold text-heading">
                    {fullName || tMisc("clientFallback")} — {form.user.email}
                  </p>
                  <p className="mt-1 text-xs text-text/60">
                    {t("submittedAt", { date: formatDate(form.createdAt, locale) })}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-heading">{t("goals")}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                      {form.goals}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-heading">{t("challenges")}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                      {form.challenges}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-heading">{t("expectations")}</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                      {form.expectations}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
          <AdminListLimitNotice
            shown={forms.length}
            limit={adminListLimits.intakeForms}
          />
        </ScrollableItemList>
      )}
    </div>
  );
}
