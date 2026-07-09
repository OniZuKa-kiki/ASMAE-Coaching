import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dayOptions = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

async function updateAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const dayOfWeekRaw = String(formData.get("dayOfWeek") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const isActive = String(formData.get("isActive") || "") === "on";

  const dayOfWeek = Number(dayOfWeekRaw);
  if (!id || !startTime || !endTime) return incomplete("ar");
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return incomplete("ar");
  }

  return runAction(
    "ar",
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

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction(
    "ar",
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

  const { id } = await params;
  const row = await prisma.availability.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">تعديل فترة</h1>
          <p className="text-sm text-text/70 mt-1">
            {dayOptions.find((d) => d.value === row.dayOfWeek)?.label ?? row.dayOfWeek}
          </p>
        </div>
        <Link
          href={adminUrl("/settings/availability")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card className="p-5">
        <ActionForm action={updateAvailability} locale="ar" className="grid md:grid-cols-2 gap-4" id={`availability-update-${row.id}`}>
          <input type="hidden" name="id" value={row.id} />

          <AdminFormField label="اليوم" htmlFor="edit-avail-day">
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

          <AdminFormField label="الحالة">
            <label className="inline-flex items-center gap-2 text-sm text-text h-[46px]">
              <input type="checkbox" name="isActive" defaultChecked={row.isActive} />
              فترة نشطة
            </label>
          </AdminFormField>

          <AdminFormField label="وقت البداية" htmlFor="edit-avail-start">
            <Input
              id="edit-avail-start"
              name="startTime"
              type="time"
              defaultValue={row.startTime}
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label="وقت النهاية" htmlFor="edit-avail-end">
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

        <AdminFormActions align="end" className="mt-4 pt-4 border-t border-border/50">
          <AdminPrimaryButton form={`availability-update-${row.id}`}>
            حفظ التعديلات
          </AdminPrimaryButton>
          <ActionForm action={deleteAvailability} locale="ar" className="inline-flex">
            <input type="hidden" name="id" value={row.id} />
            <AdminDangerButton>حذف الفترة</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>
    </div>
  );
}
