import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";

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

async function updateCourse(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = Number(String(formData.get("price") || ""));
  const isPublished = String(formData.get("isPublished") || "") === "on";
  if (!id || !title || !description || !Number.isFinite(priceRaw)) return;

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
  redirect(`/admin/courses/${id}/edit`);
}

async function deleteCourse(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect("/admin/courses");
}

async function addModule(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;
  const courseId = String(formData.get("courseId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!courseId || !title) return;

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
  redirect(`/admin/courses/${courseId}/edit`);
}

async function updateModule(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  const title = String(formData.get("title") || "").trim();
  const orderRaw = Number(String(formData.get("order") || ""));
  if (!courseId || !moduleId || !title || !Number.isFinite(orderRaw)) return;

  await prisma.courseModule.update({
    where: { id: moduleId },
    data: { title, order: Math.max(1, Math.round(orderRaw)) },
  });
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect(`/admin/courses/${courseId}/edit`);
}

async function deleteModule(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  if (!courseId || !moduleId) return;

  await prisma.courseModule.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect(`/admin/courses/${courseId}/edit`);
}

async function addLesson(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const courseId = String(formData.get("courseId") || "");
  const moduleId = String(formData.get("moduleId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const pdfUrl = String(formData.get("pdfUrl") || "").trim();
  const durationRaw = Number(String(formData.get("duration") || ""));
  if (!courseId || !moduleId || !title) return;

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
      duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
      order: (max._max.order ?? 0) + 1,
    },
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect(`/admin/courses/${courseId}/edit`);
}

async function updateLesson(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const courseId = String(formData.get("courseId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const pdfUrl = String(formData.get("pdfUrl") || "").trim();
  const durationRaw = Number(String(formData.get("duration") || ""));
  const orderRaw = Number(String(formData.get("order") || ""));
  if (!courseId || !lessonId || !title || !Number.isFinite(orderRaw)) return;

  await prisma.courseLesson.update({
    where: { id: lessonId },
    data: {
      title,
      description: description || null,
      videoUrl: videoUrl || null,
      pdfUrl: pdfUrl || null,
      duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
      order: Math.max(1, Math.round(orderRaw)),
    },
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect(`/admin/courses/${courseId}/edit`);
}

async function deleteLesson(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const courseId = String(formData.get("courseId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  if (!courseId || !lessonId) return;

  await prisma.courseLesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/dashboard/resources");
  redirect(`/admin/courses/${courseId}/edit`);
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
            Modifier la formation
          </h1>
          <p className="text-sm text-text/70 mt-1">Slug: {course.slug}</p>
        </div>
        <Link
          href="/admin/courses"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">Informations</h2>
        <form action={updateCourse} className="space-y-3">
          <input type="hidden" name="id" value={course.id} />
          <input
            name="title"
            defaultValue={course.title}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            defaultValue={course.description}
            rows={5}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3 items-center">
            <input
              name="price"
              type="number"
              min="0"
              defaultValue={course.price}
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <label className="inline-flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} />
              Formation publiée
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="submit"
              formAction={deleteCourse}
              className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-heading text-xl text-heading mb-4">Modules et leçons</h2>

        <form action={addModule} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input type="hidden" name="courseId" value={course.id} />
          <input
            name="title"
            placeholder="Titre du module"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Ajouter module
          </button>
        </form>

        {course.modules.length === 0 ? (
          <p className="text-sm text-text/70">Aucun module pour cette formation.</p>
        ) : (
          <div className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <form action={updateModule} className="grid sm:grid-cols-[1fr_110px_auto] gap-3">
                  <input type="hidden" name="courseId" value={course.id} />
                  <input type="hidden" name="moduleId" value={module.id} />
                  <input
                    name="title"
                    defaultValue={module.title}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                    required
                  />
                  <input
                    name="order"
                    type="number"
                    min="1"
                    defaultValue={module.order}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                    required
                  />
                  <div className="flex gap-2 sm:justify-end">
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Sauver
                    </button>
                    <button
                      type="submit"
                      formAction={deleteModule}
                      className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </form>

                <div className="mt-4">
                  <h3 className="font-semibold text-heading mb-3">Ajouter une leçon</h3>
                  <form action={addLesson} className="grid md:grid-cols-5 gap-3">
                    <input type="hidden" name="courseId" value={course.id} />
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input
                      name="title"
                      placeholder="Titre"
                      className="rounded-xl border border-border bg-card px-4 py-3"
                      required
                    />
                    <input
                      name="videoUrl"
                      placeholder="URL vidéo"
                      className="rounded-xl border border-border bg-card px-4 py-3"
                    />
                    <input
                      name="pdfUrl"
                      placeholder="URL PDF"
                      className="rounded-xl border border-border bg-card px-4 py-3"
                    />
                    <input
                      name="duration"
                      type="number"
                      min="1"
                      placeholder="Durée (min)"
                      className="rounded-xl border border-border bg-card px-4 py-3"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
                    >
                      Ajouter
                    </button>
                    <textarea
                      name="description"
                      placeholder="Description (optionnel)"
                      rows={2}
                      className="md:col-span-5 rounded-xl border border-border bg-card px-4 py-3"
                    />
                  </form>
                </div>

                {module.lessons.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="font-semibold text-heading">Leçons</h3>
                    {module.lessons.map((lesson) => (
                      <Card key={lesson.id} className="p-4">
                        <form action={updateLesson} className="grid md:grid-cols-5 gap-3">
                          <input type="hidden" name="courseId" value={course.id} />
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <input
                            name="title"
                            defaultValue={lesson.title}
                            className="rounded-xl border border-border bg-card px-4 py-3"
                            required
                          />
                          <input
                            name="videoUrl"
                            defaultValue={lesson.videoUrl ?? ""}
                            placeholder="URL vidéo"
                            className="rounded-xl border border-border bg-card px-4 py-3"
                          />
                          <input
                            name="pdfUrl"
                            defaultValue={lesson.pdfUrl ?? ""}
                            placeholder="URL PDF"
                            className="rounded-xl border border-border bg-card px-4 py-3"
                          />
                          <input
                            name="duration"
                            type="number"
                            min="1"
                            defaultValue={lesson.duration ?? ""}
                            placeholder="Durée"
                            className="rounded-xl border border-border bg-card px-4 py-3"
                          />
                          <input
                            name="order"
                            type="number"
                            min="1"
                            defaultValue={lesson.order}
                            placeholder="Ordre"
                            className="rounded-xl border border-border bg-card px-4 py-3"
                            required
                          />
                          <textarea
                            name="description"
                            defaultValue={lesson.description ?? ""}
                            rows={2}
                            className="md:col-span-4 rounded-xl border border-border bg-card px-4 py-3"
                          />
                          <div className="flex gap-2 md:justify-end">
                            <button
                              type="submit"
                              className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              Sauver
                            </button>
                            <button
                              type="submit"
                              formAction={deleteLesson}
                              className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        </form>
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

