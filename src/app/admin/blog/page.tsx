import { revalidatePath } from "next/cache";
import Link from "next/link";
import { AdminFormField } from "@/components/admin/form-field";
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
import { adminUrl } from "@/lib/admin-path";
import { adminErrors } from "@/lib/api-errors";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { adminFilterLabels } from "@/lib/admin-filters";

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

  if (!title || !excerpt || !content) return incomplete("ar");

  return runAction("ar", async () => {
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
  if (!id) return incomplete("ar");

  return runAction("ar", async () => {
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
        <h2 className="font-heading text-xl text-heading mb-4">مقال جديد</h2>
        <ActionForm action={createBlogPost} locale="ar" className="space-y-4">
          <AdminFormField label="عنوان المقال" htmlFor="new-post-title">
            <Input id="new-post-title" name="title" className="w-full" required />
          </AdminFormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminFormField label="الفئة" htmlFor="new-post-category">
              <Input
                id="new-post-category"
                name="category"
                placeholder="مثال: الرفاهية"
                className="w-full"
              />
            </AdminFormField>

            <AdminFormField label="ملخص قصير" htmlFor="new-post-excerpt">
              <Input id="new-post-excerpt" name="excerpt" className="w-full" required />
            </AdminFormField>
          </div>

          <AdminFormField label="محتوى المقال" htmlFor="new-post-content">
            <Textarea
              id="new-post-content"
              name="content"
              rows={6}
              className="w-full"
              required
            />
          </AdminFormField>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            إنشاء مسودة
          </button>
        </ActionForm>
      </Card>
      <AdminFilterCard title={adminFilterLabels.blog.title}>
        <AdminFormField label={adminFilterLabels.search} htmlFor="blog-filter-q">
          <Input
            id="blog-filter-q"
            name="q"
            defaultValue={q}
            placeholder={adminFilterLabels.blog.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label="حالة النشر">
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: "جميع الحالات" },
              { value: "published", label: "منشور" },
              { value: "draft", label: "مسودات" },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={adminFilterLabels.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: adminFilterLabels.sortNewest },
              { value: "published_desc", label: "نُشر مؤخرًا" },
              { value: "title_asc", label: adminFilterLabels.sortTitleAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا توجد مقالات حالياً.</p>
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
                      ? `نُشر في ${formatDate(post.publishedAt)}`
                      : "مسودة"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/blog/${post.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    تعديل
                  </Link>
                  <ActionForm action={togglePublish} locale="ar">
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {post.isPublished ? "إلغاء النشر" : "نشر"}
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
