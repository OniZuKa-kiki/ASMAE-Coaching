import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import {
  AdminDangerButton,
  AdminFormActions,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
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
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function updateAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  const dayOfWeekRaw = String(formData.get("dayOfWeek") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const isActive = String(formData.get("isActive") || "") === "on";

  const dayOfWeek = Number(dayOfWeekRaw);
  if (!id || !startTime || !endTime) return incomplete(locale);
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return incomplete(locale);
  }

  return runAction(
    locale,
    async () => {
      await prisma.availability.update({
        where: { id },
        data: {
          dayOfWeek,
          startTime,
          endTime,
          isActive,
        },
      });

      revalidatePath("/admin/settings/availability");
    },
    "updated",
    adminUrl("/settings/availability")
  );
}

async function deleteAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(
    locale,
    async () => {
      await prisma.availability.delete({ where: { id } });
      revalidatePath("/admin/settings/availability");
    },
    "deleted",
    adminUrl("/settings/availability")
  );
}

export default async function AdminAvailabilityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [t, tFields, tActions, tCommon] = await Promise.all([
    getTranslations("adminPages.settings.availability"),
    getTranslations("adminPages.fields"),
    getTranslations("adminPages.actions"),
    getTranslations("admin.common"),
  ]);
  const dayOptions = getAdminDayOptions(locale);

  const { id } = await params;
  const row = await prisma.availability.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("editTitle")}</h1>
          <p className="mt-1 text-sm text-text/70">
            {getAdminDayLabel(locale, row.dayOfWeek)}
          </p>
        </div>
        <Link
          href={adminUrl("/settings/availability")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <Card className="p-5">
        <ActionForm
          action={updateAvailability}
          locale={locale}
          className="grid gap-4 md:grid-cols-2"
          id={`availability-update-${row.id}`}
        >
          <input type="hidden" name="id" value={row.id} />

          <AdminFormField label={t("day")} htmlFor="edit-avail-day">
            <select
              id="edit-avail-day"
              name="dayOfWeek"
              defaultValue={row.dayOfWeek}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              {dayOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label={tFields("status")}>
            <label className="inline-flex h-[46px] items-center gap-2 text-sm text-text">
              <input type="checkbox" name="isActive" defaultChecked={row.isActive} />
              {t("activeSlot")}
            </label>
          </AdminFormField>

          <AdminFormField label={t("startTime")} htmlFor="edit-avail-start">
            <Input
              id="edit-avail-start"
              name="startTime"
              type="time"
              defaultValue={row.startTime}
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label={t("endTime")} htmlFor="edit-avail-end">
            <Input
              id="edit-avail-end"
              name="endTime"
              type="time"
              defaultValue={row.endTime}
              className="text-sm"
              required
            />
          </AdminFormField>
        </ActionForm>

        <AdminFormActions align="end" className="mt-4 border-t border-border/50 pt-4">
          <AdminPrimaryButton form={`availability-update-${row.id}`}>
            {tActions("save")}
          </AdminPrimaryButton>
          <ActionForm action={deleteAvailability} locale={locale} className="inline-flex">
            <input type="hidden" name="id" value={row.id} />
            <AdminDangerButton>{t("deleteSlot")}</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>
    </div>
  );
}
