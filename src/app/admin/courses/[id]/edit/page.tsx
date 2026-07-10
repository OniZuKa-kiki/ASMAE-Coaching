import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminFormField } from "@/components/admin/form-field";
import {
  AdminDangerButton,
  AdminFormActions,
  AdminOutlineButton,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import {
  parseLessonResourceCategory,
  resourceCategoryFilterOptions,
} from "@/lib/resource-categories";

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

async function updateCourse(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = Number(String(formData.get("price") || ""));
  const isPublished = String(formData.get("isPublished") || "") === "on";
  if (!id || !title || !description || !Number.isFinite(priceRaw)) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      const baseSlug = slugify(title);
      const conflict = await prisma.course.findFirst({
        where: { slug: baseSlug, id: { not: id } },
        select: { id: true },
      });
      const slug = conflict ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

      await prisma.course.update({
        where: { id },
        data: {
          title,
          description,
          price: Math.max(0, Math.round(priceRaw)),
          isPublished,
          slug,
        },
      });

      revalidatePath("/admin/courses");
      revalidatePath("/courses");
    },
    "saved",
    adminUrl(`/courses/${id}/edit`)
  );
}

async function deleteCourse(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.course.delete({ where: { id } });
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "deleted",
    adminUrl("/courses")
  );
}

async function addModule(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!courseId || !title) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      const max = await prisma.courseModule.aggregate({
        where: { courseId },
        _max: { order: true },
      });
      await prisma.courseModule.create({
        data: {
          courseId,
          title,
          order: (max._max.order ?? 0) + 1,
        },
      });
      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "created",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

async function updateModule(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  const title = String(formData.get("title") || "").trim();
  const orderRaw = Number(String(formData.get("order") || ""));
  if (!courseId || !moduleId || !title || !Number.isFinite(orderRaw)) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.courseModule.update({
        where: { id: moduleId },
        data: { title, order: Math.max(1, Math.round(orderRaw)) },
      });
      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "updated",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

async function deleteModule(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  if (!courseId || !moduleId) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.courseModule.delete({ where: { id: moduleId } });
      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "deleted",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

async function addLesson(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const pdfUrl = String(formData.get("pdfUrl") || "").trim();
  const categoryRaw = String(formData.get("resourceCategory") || "").trim();
  const resourceCategory = parseLessonResourceCategory(categoryRaw);
  const durationRaw = Number(String(formData.get("duration") || ""));
  if (!courseId || !moduleId || !title) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      const max = await prisma.courseLesson.aggregate({
        where: { moduleId },
        _max: { order: true },
      });

      await prisma.courseLesson.create({
        data: {
          moduleId,
          title,
          description: description || null,
          videoUrl: videoUrl || null,
          pdfUrl: pdfUrl || null,
          resourceCategory,
          duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
          order: (max._max.order ?? 0) + 1,
        },
      });

      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "created",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

async function updateLesson(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const pdfUrl = String(formData.get("pdfUrl") || "").trim();
  const categoryRaw = String(formData.get("resourceCategory") || "").trim();
  const resourceCategory = parseLessonResourceCategory(categoryRaw);
  const durationRaw = Number(String(formData.get("duration") || ""));
  const orderRaw = Number(String(formData.get("order") || ""));
  if (!courseId || !lessonId || !title || !Number.isFinite(orderRaw)) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.courseLesson.update({
        where: { id: lessonId },
        data: {
          title,
          description: description || null,
          videoUrl: videoUrl || null,
          pdfUrl: pdfUrl || null,
          resourceCategory,
          duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
          order: Math.max(1, Math.round(orderRaw)),
        },
      });

      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "updated",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

async function deleteLesson(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const courseId = String(formData.get("courseId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  if (!courseId || !lessonId) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.courseLesson.delete({ where: { id: lessonId } });
      revalidatePath(`/admin/courses/${courseId}/edit`);
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/dashboard/resources");
    },
    "deleted",
    adminUrl(`/courses/${courseId}/edit`)
  );
}

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            تعديل الدورة
          </h1>
          <p className="text-sm text-text/70 mt-1">Slug: {course.slug}</p>
        </div>
        <Link
          href={adminUrl("/courses")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">المعلومات</h2>
        <ActionForm action={updateCourse} locale="ar" className="space-y-4" id="course-update-form">
          <input type="hidden" name="id" value={course.id} />

          <AdminFormField label="عنوان الدورة" htmlFor="course-title">
            <Input
              id="course-title"
              name="title"
              defaultValue={course.title}
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField label="وصف الدورة" htmlFor="course-description">
            <Textarea
              id="course-description"
              name="description"
              defaultValue={course.description}
              rows={5}
              className="w-full"
              required
            />
          </AdminFormField>

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <AdminFormField
              label="السعر (بالسنتيم)"
              htmlFor="course-price"
              hint="مثال: 19700 = 197,00 €"
            >
              <Input
                id="course-price"
                name="price"
                type="number"
                min="0"
                defaultValue={course.price}
                className="w-full"
              />
            </AdminFormField>

            <label className="inline-flex items-center gap-2 text-sm text-text h-[46px]">
              <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} />
              منشورة على الموقع
            </label>
          </div>
        </ActionForm>
        <AdminFormActions className="mt-2">
          <AdminPrimaryButton form="course-update-form">حفظ</AdminPrimaryButton>
          <ActionForm action={deleteCourse} locale="ar" className="inline-flex">
            <input type="hidden" name="id" value={course.id} />
            <AdminDangerButton>حذف الدورة</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>

      <Card>
        <h2 className="font-heading text-xl text-heading mb-4">الوحدات والدروس</h2>

        <ActionForm action={addModule} locale="ar" className="grid sm:grid-cols-[1fr_auto] gap-4 mb-6 items-end">
          <input type="hidden" name="courseId" value={course.id} />
          <AdminFormField label="عنوان الوحدة" htmlFor={`module-new-${course.id}`}>
            <Input
              id={`module-new-${course.id}`}
              name="title"
              className="w-full"
              required
            />
          </AdminFormField>
          <AdminPrimaryButton className="w-full sm:w-auto">إضافة وحدة</AdminPrimaryButton>
        </ActionForm>

        {course.modules.length === 0 ? (
          <p className="text-sm text-text/70">لا توجد وحدات لهذه الدورة.</p>
        ) : (
          <div className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-border/60 bg-background/40 p-4 space-y-4">
                <ActionForm
                  action={updateModule}
                  locale="ar"
                  id={`module-update-${module.id}`}
                  className="space-y-3"
                >
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={module.id} />
                  <div className="grid sm:grid-cols-[1fr_110px] gap-3">
                    <AdminFormField label="عنوان الوحدة">
                      <Input
                        name="title"
                        defaultValue={module.title}
                        className="w-full"
                        required
                      />
                    </AdminFormField>
                    <AdminFormField label="الترتيب">
                      <Input
                        name="order"
                        type="number"
                        min="1"
                        defaultValue={module.order}
                        className="w-full"
                        required
                      />
                    </AdminFormField>
                  </div>
                </ActionForm>
                <AdminFormActions align="end">
                  <AdminOutlineButton form={`module-update-${module.id}`}>
                    حفظ
                  </AdminOutlineButton>
                  <ActionForm action={deleteModule} locale="ar" className="inline-flex">
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={module.id} />
                    <AdminDangerButton>حذف</AdminDangerButton>
                  </ActionForm>
                </AdminFormActions>

                <div>
                  <h3 className="font-semibold text-heading mb-3">إضافة درس</h3>
                  <ActionForm action={addLesson} locale="ar" className="space-y-4">
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={module.id} />

                    <div className="grid md:grid-cols-2 gap-4">
                      <AdminFormField label="عنوان الدرس">
                        <Input name="title" className="w-full" required />
                      </AdminFormField>
                      <MediaUrlField
                        mediaType="video"
                        urlName="videoUrl"
                        durationName="duration"
                        label="رابط الفيديو"
                        hint="رابط ملف فيديو مباشر (.mp4, .webm)."
                      />
                      <AdminFormField label="رابط PDF">
                        <Input name="pdfUrl" className="w-full" placeholder="https://..." />
                      </AdminFormField>
                      <AdminFormField label="فئة المورد">
                        <FilterSelect
                          name="resourceCategory"
                          value=""
                          options={[
                            { value: "", label: "تلقائي (حسب الرابط)" },
                            ...resourceCategoryFilterOptions.filter(
                              (option) => option.value !== "all"
                            ),
                          ]}
                        />
                      </AdminFormField>
                    </div>

                    <AdminFormField label="وصف الدرس (اختياري)">
                      <Textarea name="description" rows={2} className="w-full" />
                    </AdminFormField>

                    <AdminFormActions>
                      <AdminPrimaryButton>إضافة الدرس</AdminPrimaryButton>
                    </AdminFormActions>
                  </ActionForm>
                </div>

                {module.lessons.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="font-semibold text-heading">الدروس</h3>
                    {module.lessons.map((lesson) => (
                      <Card key={lesson.id} className="p-4">
                        <ActionForm
                          action={updateLesson}
                          locale="ar"
                          id={`lesson-update-${lesson.id}`}
                          className="space-y-4"
                        >
                          <input type="hidden" name="courseId" value={course.id} />
                          <input type="hidden" name="lessonId" value={lesson.id} />

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AdminFormField label="عنوان الدرس">
                              <Input
                                name="title"
                                defaultValue={lesson.title}
                                className="w-full"
                                required
                              />
                            </AdminFormField>
                            <MediaUrlField
                              mediaType="video"
                              urlName="videoUrl"
                              durationName="duration"
                              label="رابط الفيديو"
                              defaultUrl={lesson.videoUrl ?? ""}
                              defaultDuration={lesson.duration}
                              hint="رابط ملف فيديو مباشر (.mp4, .webm)."
                            />
                            <AdminFormField label="رابط PDF">
                              <Input
                                name="pdfUrl"
                                defaultValue={lesson.pdfUrl ?? ""}
                                className="w-full"
                              />
                            </AdminFormField>
                            <AdminFormField label="فئة المورد">
                              <FilterSelect
                                name="resourceCategory"
                                value={lesson.resourceCategory ?? ""}
                                options={[
                                  { value: "", label: "تلقائي (حسب الرابط)" },
                                  ...resourceCategoryFilterOptions.filter(
                                    (option) => option.value !== "all"
                                  ),
                                ]}
                              />
                            </AdminFormField>
                            <AdminFormField label="الترتيب">
                              <Input
                                name="order"
                                type="number"
                                min="1"
                                defaultValue={lesson.order}
                                className="w-full"
                                required
                              />
                            </AdminFormField>
                          </div>

                          <AdminFormField label="وصف الدرس">
                            <Textarea
                              name="description"
                              defaultValue={lesson.description ?? ""}
                              rows={2}
                              className="w-full"
                            />
                          </AdminFormField>
                        </ActionForm>
                        <AdminFormActions align="end" className="mt-3">
                          <AdminOutlineButton form={`lesson-update-${lesson.id}`}>
                            حفظ الدرس
                          </AdminOutlineButton>
                          <ActionForm action={deleteLesson} locale="ar" className="inline-flex">
                            <input type="hidden" name="courseId" value={course.id} />
                            <input type="hidden" name="lessonId" value={lesson.id} />
                            <AdminDangerButton>حذف</AdminDangerButton>
                          </ActionForm>
                        </AdminFormActions>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
