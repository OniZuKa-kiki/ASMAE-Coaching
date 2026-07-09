import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminFormField } from "@/components/admin/form-field";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

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

  const params = await searchParams;
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
    take: 100,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            استبيانات العملاء
          </h1>
          <p className="text-sm text-text/70 mt-1">
            الإجابات المشاركة قبل الجلسة الأولى.
          </p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-3 gap-4">
          <AdminFormField label="بحث عن عميل" htmlFor="intake-filter-q">
            <Input
              id="intake-filter-q"
              name="q"
              defaultValue={q}
              placeholder="الاسم أو البريد..."
              className="text-sm"
            />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <FilterSelect
              name="sort"
              value={sort}
              options={[
                { value: "newest", label: "الأحدث" },
                { value: "oldest", label: "الأقدم" },
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

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد إجابات حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const fullName = `${form.user.firstName ?? ""} ${form.user.lastName ?? ""}`.trim();
            return (
              <Card key={form.id}>
                <div className="mb-4">
                  <p className="font-semibold text-heading">
                    {fullName || "عميل"} — {form.user.email}
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    وُرد في {formatDate(form.createdAt)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">الأهداف</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.goals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">التحديات / العوائق</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.challenges}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">التوقعات</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.expectations}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

