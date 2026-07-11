import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getActionLocale } from "@/lib/action-locale";
import {
  getAdminDayLabel,
  getAdminDayOptions,
} from "@/lib/admin-i18n";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { FilterSelect } from "@/components/ui/filter-select";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function createAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const dayOfWeekRaw = String(formData.get("dayOfWeek") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const isActive = String(formData.get("isActive") || "") === "on";

  const dayOfWeek = Number(dayOfWeekRaw);
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return incomplete(locale);
  }
  if (!startTime || !endTime) return incomplete(locale);

  return runAction(locale, async () => {
    await prisma.availability.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        isActive,
      },
    });

    revalidatePath("/admin/settings/availability");
  }, "created");
}

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const dayFilter = Array.isArray(params.day) ? params.day[0] : params.day;

  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [t, tFields, tActions, tStatuses, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.availability"),
    getTranslations("adminPages.fields"),
    getTranslations("adminPages.actions"),
    getTranslations("adminPages.statuses"),
    getTranslations("admin.common"),
  ]);
  const dayOptions = getAdminDayOptions(locale);

  const where =
    dayFilter && dayFilter !== ""
      ? { dayOfWeek: Number(dayFilter) }
      : undefined;

  const rows = await prisma.availability.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
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

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-heading text-xl font-semibold text-heading">
          {t("addSlot")}
        </h2>

        <ActionForm
          action={createAvailability}
          locale={locale}
          className="grid gap-4 md:grid-cols-5"
        >
          <AdminFormField label={t("day")}>
            <FilterSelect
              name="dayOfWeek"
              value={dayFilter ?? "1"}
              options={dayOptions.map((d) => ({ value: d.value, label: d.label }))}
            />
          </AdminFormField>

          <AdminFormField label={t("startTime")} htmlFor="avail-start">
            <Input
              id="avail-start"
              name="startTime"
              type="time"
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label={t("endTime")} htmlFor="avail-end">
            <Input
              id="avail-end"
              name="endTime"
              type="time"
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label={tFields("status")}>
            <label className="inline-flex h-[46px] items-center gap-2 text-sm text-text">
              <input type="checkbox" name="isActive" defaultChecked />
              {t("activeSlot")}
            </label>
          </AdminFormField>

          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover md:col-span-1"
          >
            {t("create")}
          </button>
        </ActionForm>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-heading text-xl font-semibold text-heading">
          {t("listSection")}
        </h2>

        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-text/70">{t("noSlots")}</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-heading">
                    {getAdminDayLabel(locale, row.dayOfWeek)}
                  </p>
                  <p className="text-sm text-text/70">
                    {row.startTime} → {row.endTime}
                  </p>
                  <p className="mt-1 text-xs text-text/60">
                    {row.isActive ? tStatuses("active") : t("inactiveSlot")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/settings/availability/${row.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {tActions("edit")}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
