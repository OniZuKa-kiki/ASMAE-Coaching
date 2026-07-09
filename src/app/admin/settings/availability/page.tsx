import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { FilterSelect } from "@/components/ui/filter-select";

export const dynamic = "force-dynamic";

const dayOptions = [
  { value: "0", label: "الأحد" },
  { value: "1", label: "الإثنين" },
  { value: "2", label: "الثلاثاء" },
  { value: "3", label: "الأربعاء" },
  { value: "4", label: "الخميس" },
  { value: "5", label: "الجمعة" },
  { value: "6", label: "السبت" },
];

async function createAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const dayOfWeekRaw = String(formData.get("dayOfWeek") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const isActive = String(formData.get("isActive") || "") === "on";

  const dayOfWeek = Number(dayOfWeekRaw);
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return incomplete("ar");
  }
  if (!startTime || !endTime) return incomplete("ar");

  return runAction("ar", async () => {
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

function dayLabel(dayOfWeek: number) {
  return (
    dayOptions.find((d) => Number(d.value) === dayOfWeek)?.label ?? `يوم ${dayOfWeek}`
  );
}

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const dayFilter = Array.isArray(params.day)
    ? params.day[0]
    : params.day;

  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

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
          <h1 className="page-header-title">
            التوفر
          </h1>
          <p className="text-text/70 text-sm mt-1">
            حدد فترات الاستشارة المستخدمة في الجدول.
          </p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card className="mb-6 p-5">
        <h2 className="font-heading text-xl font-semibold text-heading mb-4">
          إضافة فترة
        </h2>

        <ActionForm action={createAvailability} locale="ar" className="grid md:grid-cols-5 gap-4">
          <AdminFormField label="اليوم">
            <FilterSelect
              name="dayOfWeek"
              value={dayFilter ?? "1"}
              options={dayOptions.map((d) => ({ value: d.value, label: d.label }))}
            />
          </AdminFormField>

          <AdminFormField label="وقت البداية" htmlFor="avail-start">
            <Input
              id="avail-start"
              name="startTime"
              type="time"
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label="وقت النهاية" htmlFor="avail-end">
            <Input
              id="avail-end"
              name="endTime"
              type="time"
              className="text-sm"
              required
            />
          </AdminFormField>

          <AdminFormField label="الحالة">
            <label className="inline-flex items-center gap-2 text-sm text-text h-[46px]">
              <input type="checkbox" name="isActive" defaultChecked />
              فترة نشطة
            </label>
          </AdminFormField>

          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors md:col-span-1"
          >
            إنشاء
          </button>
        </ActionForm>
      </Card>

      <Card className="p-5">
        <h2 className="font-heading text-xl font-semibold text-heading mb-4">
          القائمة
        </h2>

        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-text/70">لا توجد فترات حالياً.</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-heading">{dayLabel(row.dayOfWeek)}</p>
                  <p className="text-sm text-text/70">
                    {row.startTime} → {row.endTime}
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    {row.isActive ? "نشط" : "غير نشط"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/settings/availability/${row.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    تعديل
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
