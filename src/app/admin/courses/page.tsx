import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
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

async function createCourse(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  if (!title || !description || !priceRaw) return;

  const price = Number(priceRaw);
  if (!Number.isFinite(price)) return;

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
}

async function toggleCoursePublish(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return;

  await prisma.course.update({
    where: { id },
    data: { isPublished: !course.isPublished },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
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
        Formations
      </h1>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">Nouvelle formation</h2>
        <form action={createCourse} className="space-y-3">
          <input
            name="title"
            placeholder="Titre"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <input
            name="price"
            type="number"
            min="0"
            placeholder="Prix en centimes (ex: 19700)"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Créer le brouillon
            </button>
          </div>
        </form>
      </Card>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher titre ou slug..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="published"
            value={published}
            options={[
              { value: "", label: "Publié + brouillon" },
              { value: "yes", label: "Publiées" },
              { value: "no", label: "Brouillons" },
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récentes" },
              { value: "title_asc", label: "Titre A→Z" },
              { value: "price_desc", label: "Prix ↓" },
              { value: "price_asc", label: "Prix ↑" },
            ]}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Filtrer
          </button>
        </form>
      </Card>

      {courses.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucune formation pour le moment.</p>
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
                    Modules: {course.modules.length} • Inscrits: {course.enrollments.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    Éditer
                  </Link>
                  <form action={toggleCoursePublish}>
                    <input type="hidden" name="id" value={course.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {course.isPublished ? "Dépublier" : "Publier"}
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
