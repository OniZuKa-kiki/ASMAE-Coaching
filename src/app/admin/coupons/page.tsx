import { adminUrl } from "@/lib/admin-path";
import { revalidatePath } from "next/cache";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { adminErrors } from "@/lib/api-errors";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function createCoupon(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountPercent = Number(String(formData.get("discountPercent") || ""));
  const maxUses = Number(String(formData.get("maxUses") || ""));
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();

  if (!code || !Number.isFinite(discountPercent) || discountPercent <= 0) {
    return incomplete("ar");
  }

  return runAction("ar", async () => {
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

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction("ar", async () => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error(adminErrors.notFound);

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
  const params = await searchParams;
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
    take: 100,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">قسائم الخصم</h1>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">قسيمة جديدة</h2>
        <ActionForm action={createCoupon} locale="ar" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminFormField label="رمز القسيمة" htmlFor="coupon-code" hint="مثال: BIENVENUE10">
            <Input
              id="coupon-code"
              name="code"
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField label="نسبة الخصم (%)" htmlFor="coupon-percent">
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

          <AdminFormField label="الحد الأقصى للاستخدام" htmlFor="coupon-max" hint="اتركه فارغاً لاستخدام غير محدود.">
            <Input
              id="coupon-max"
              name="maxUses"
              type="number"
              min="1"
              className="w-full"
            />
          </AdminFormField>

          <AdminFormField label="تاريخ الانتهاء" htmlFor="coupon-expires" hint="اختياري">
            <Input id="coupon-expires" name="expiresAt" type="date" className="w-full" />
          </AdminFormField>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              حفظ
            </button>
          </div>
        </ActionForm>
      </Card>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-4 gap-4">
          <AdminFormField label="بحث" htmlFor="coupon-filter-q">
            <Input
              id="coupon-filter-q"
              name="q"
              defaultValue={q}
              placeholder="رمز القسيمة..."
              className="text-sm"
            />
          </AdminFormField>
          <AdminFormField label="الحالة">
            <FilterSelect
              name="active"
              value={active}
              options={[
                { value: "", label: "نشط + غير نشط" },
                { value: "yes", label: "نشطة" },
                { value: "no", label: "غير نشطة" },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <FilterSelect
              name="sort"
              value={sort}
              options={[
                { value: "created_desc", label: "الأحدث" },
                { value: "code_asc", label: "الرمز أ→ي" },
                { value: "expires_asc", label: "تنتهي قريباً" },
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

      {coupons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد قسائم حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{coupon.code}</p>
                  <p className="text-sm text-text/70">
                    -{coupon.discountPercent ?? 0}% • مستخدم {coupon.usedCount}
                    {coupon.maxUses ? `/${coupon.maxUses}` : ""}
                  </p>
                  <p className="text-xs text-text/60">
                    تنتهي: {coupon.expiresAt ? formatDate(coupon.expiresAt) : "أبداً"}
                  </p>
                </div>
                <ActionForm action={toggleCoupon} locale="ar">
                  <input type="hidden" name="id" value={coupon.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {coupon.isActive ? "تعطيل" : "تفعيل"}
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
