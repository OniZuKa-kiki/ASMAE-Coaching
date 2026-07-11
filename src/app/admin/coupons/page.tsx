import { revalidatePath } from "next/cache";
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
import {
  getAdminFilters,
} from "@/lib/admin-i18n";
import { adminListLimits } from "@/lib/admin-filters";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function createCoupon(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountPercent = Number(String(formData.get("discountPercent") || ""));
  const maxUses = Number(String(formData.get("maxUses") || ""));
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();

  if (!code || !Number.isFinite(discountPercent) || discountPercent <= 0) {
    return incomplete(locale);
  }

  return runAction(locale, async () => {
    await prisma.coupon.upsert({
      where: { code },
      update: {
        discountPercent,
        maxUses: Number.isFinite(maxUses) && maxUses > 0 ? maxUses : null,
        expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
        isActive: true,
      },
      create: {
        code,
        discountPercent,
        maxUses: Number.isFinite(maxUses) && maxUses > 0 ? maxUses : null,
        expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
        isActive: true,
      },
    });

    revalidatePath("/admin/coupons");
  }, "created");
}

async function toggleCoupon(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("NOT_FOUND");

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    revalidatePath("/admin/coupons");
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tStatuses, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.coupons"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.statuses"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const active = getQueryValue(params.active).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(active === "yes"
      ? { isActive: true }
      : active === "no"
      ? { isActive: false }
      : {}),
    ...(q ? { code: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const orderBy =
    sort === "code_asc"
      ? ({ code: "asc" } as const)
      : sort === "expires_asc"
      ? ({ expiresAt: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const coupons = await prisma.coupon.findMany({
    where,
    orderBy,
    take: adminListLimits.coupons,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>

      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("newCoupon")}</h2>
        <ActionForm
          action={createCoupon}
          locale={locale}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AdminFormField
            label={tFields("couponCode")}
            htmlFor="coupon-code"
            hint={tFields("couponCodeHint")}
          >
            <Input id="coupon-code" name="code" className="w-full" required />
          </AdminFormField>

          <AdminFormField label={tFields("discountPercent")} htmlFor="coupon-percent">
            <Input
              id="coupon-percent"
              name="discountPercent"
              type="number"
              min="1"
              max="100"
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("maxUses")}
            htmlFor="coupon-max"
            hint={tFields("maxUsesHint")}
          >
            <Input
              id="coupon-max"
              name="maxUses"
              type="number"
              min="1"
              className="w-full"
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("expiresAt")}
            htmlFor="coupon-expires"
            hint={tFields("expiresAtHint")}
          >
            <Input id="coupon-expires" name="expiresAt" type="date" className="w-full" />
          </AdminFormField>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {tActions("save")}
            </button>
          </div>
        </ActionForm>
      </Card>
      <AdminFilterCard title={filters.coupons.title}>
        <AdminFormField label={filters.search} htmlFor="coupon-filter-q">
          <Input
            id="coupon-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.coupons.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={tFields("status")}>
          <FilterSelect
            name="active"
            value={active}
            options={[
              { value: "", label: tFilters("activeAll") },
              { value: "yes", label: tStatuses("active") },
              { value: "no", label: tFilters("inactiveLabel") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "code_asc", label: filters.sortCodeAsc },
              { value: "expires_asc", label: filters.sortExpiresAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {coupons.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noCoupons")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-heading">{coupon.code}</p>
                  <p className="text-sm text-text/70">
                    {tMisc("usedCount", {
                      percent: coupon.discountPercent ?? 0,
                      used: coupon.usedCount,
                      max: coupon.maxUses ? `/${coupon.maxUses}` : "",
                    })}
                  </p>
                  <p className="text-xs text-text/60">
                    {tMisc("expiresLabel", {
                      date: coupon.expiresAt
                        ? formatDate(coupon.expiresAt, locale)
                        : tMisc("expiresNever"),
                    })}
                  </p>
                </div>
                <ActionForm action={toggleCoupon} locale={locale}>
                  <input type="hidden" name="id" value={coupon.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    {coupon.isActive
                      ? tActions("deactivate")
                      : tActions("activate")}
                  </button>
                </ActionForm>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={coupons.length}
            limit={adminListLimits.coupons}
          />
        </div>
      )}
    </div>
  );
}
