import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { adminErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

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

async function createBlogPost(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim() || "Coaching";
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !excerpt || !content) return incomplete("fr");

  return runAction("fr", async () => {
    const baseSlug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        isPublished: false,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  }, "created");
}

async function togglePublish(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("fr");

  return runAction("fr", async () => {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new Error(adminErrors.notFound);

    const nextPublished = !post.isPublished;
    await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: nextPublished,
        publishedAt: nextPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const status = getQueryValue(params.status).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status === "published"
      ? { isPublished: true }
      : status === "draft"
      ? { isPublished: false }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { category: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "title_asc"
      ? ({ title: "asc" } as const)
      : sort === "published_desc"
      ? ({ publishedAt: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy,
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header-title">Blog</h1>
      </div>

      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">Nouvel article</h2>
        <ActionForm action={createBlogPost} locale="fr" className="space-y-3">
          <input
            name="title"
            placeholder="Titre"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="category"
              placeholder="Catégorie (ex: Bien-être)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <input
              name="excerpt"
              placeholder="Résumé court"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
              required
            />
          </div>
          <textarea
            name="content"
            placeholder="Contenu de l'article"
            rows={6}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Créer le brouillon
          </button>
        </ActionForm>
      </Card>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher titre, catégorie, slug..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: "Tous statuts" },
              { value: "published", label: "Publiés" },
              { value: "draft", label: "Brouillons" },
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récents" },
              { value: "published_desc", label: "Publié récemment" },
              { value: "title_asc", label: "Titre A→Z" },
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

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucun article pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{post.title}</p>
                  <p className="text-sm text-text/70">
                    {post.category} — {post.slug}
                  </p>
                  <p className="text-xs text-text/60">
                    {post.isPublished && post.publishedAt
                      ? `Publié le ${formatDate(post.publishedAt)}`
                      : "Brouillon"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    Éditer
                  </Link>
                  <ActionForm action={togglePublish} locale="fr">
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {post.isPublished ? "Dépublier" : "Publier"}
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
