import { revalidatePath } from "next/cache";
import Link from "next/link";
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
import { adminUrl } from "@/lib/admin-path";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createCourse(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  if (!title || !description || !priceRaw) return incomplete("ar");

  const price = Number(priceRaw);
  if (!Number.isFinite(price)) return incomplete("ar");

  return runAction("ar", async () => {
    const baseSlug = slugify(title);
    const exists = await prisma.course.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    await prisma.course.create({
      data: {
        slug,
        title,
        description,
        price,
        isPublished: false,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
  }, "created");
}

async function toggleCoursePublish(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction("ar", async () => {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new Error(adminErrors.notFound);

    await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const published = getQueryValue(params.published).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(published === "yes"
      ? { isPublished: true }
      : published === "no"
      ? { isPublished: false }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "title_asc"
      ? ({ title: "asc" } as const)
      : sort === "price_desc"
      ? ({ price: "desc" } as const)
      : sort === "price_asc"
      ? ({ price: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const courses = await prisma.course.findMany({
    where,
    include: {
      modules: true,
      enrollments: true,
    },
    orderBy,
    take: 50,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        الدورات التدريبية
      </h1>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">دورة جديدة</h2>
        <ActionForm action={createCourse} locale="ar" className="space-y-4">
          <AdminFormField label="عنوان الدورة" htmlFor="new-course-title">
            <Input id="new-course-title" name="title" className="w-full" required />
          </AdminFormField>

          <AdminFormField label="وصف الدورة" htmlFor="new-course-description">
            <Textarea
              id="new-course-description"
              name="description"
              rows={4}
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField
            label="السعر (بالسنتيم)"
            htmlFor="new-course-price"
            hint="مثال: 19700 = 197,00 €"
          >
            <Input
              id="new-course-price"
              name="price"
              type="number"
              min="0"
              className="w-full"
              required
            />
          </AdminFormField>
          <div>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إنشاء مسودة
            </button>
          </div>
        </ActionForm>
      </Card>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-4 gap-4">
          <AdminFormField label="بحث" htmlFor="course-filter-q">
            <Input
              id="course-filter-q"
              name="q"
              defaultValue={q}
              placeholder="العنوان أو الرابط..."
              className="text-sm"
            />
          </AdminFormField>
          <AdminFormField label="حالة النشر">
            <FilterSelect
              name="published"
              value={published}
              options={[
                { value: "", label: "منشور + مسودة" },
                { value: "yes", label: "منشورة" },
                { value: "no", label: "مسودات" },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="ترتيب العرض">
            <FilterSelect
              name="sort"
              value={sort}
              options={[
                { value: "created_desc", label: "الأحدث" },
                { value: "title_asc", label: "العنوان أ→ي" },
                { value: "price_desc", label: "السعر ↓" },
                { value: "price_asc", label: "السعر ↑" },
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

      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد دورات حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{course.title}</p>
                  <p className="text-sm text-text/70">
                    /courses/{course.slug} • {(course.price / 100).toFixed(2)} €
                  </p>
                  <p className="text-xs text-text/60">
                    الوحدات: {course.modules.length} • المسجلون: {course.enrollments.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/courses/${course.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    تعديل
                  </Link>
                  <ActionForm action={toggleCoursePublish} locale="ar">
                    <input type="hidden" name="id" value={course.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {course.isPublished ? "إلغاء النشر" : "نشر"}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
