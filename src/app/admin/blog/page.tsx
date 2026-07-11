import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
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
import { getActionLocale } from "@/lib/action-locale";
import {
  getAdminFilters,
} from "@/lib/admin-i18n";
import { adminListLimits } from "@/lib/admin-filters";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import { filterByArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

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

  const locale = await getActionLocale();
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim() || "Coaching";
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !excerpt || !content) return incomplete(locale);

  return runAction(locale, async () => {
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
    PUBLIC_INVALIDATIONS.blog(slug);
  }, "created");
}

async function togglePublish(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new Error("NOT_FOUND");

    const nextPublished = !post.isPublished;
    await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: nextPublished,
        publishedAt: nextPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/blog");
    PUBLIC_INVALIDATIONS.blog(post.slug);
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
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.blog"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const status = getQueryValue(params.status).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(status === "published"
      ? { isPublished: true }
      : status === "draft"
      ? { isPublished: false }
      : {}),
  };

  const orderBy =
    sort === "title_asc"
      ? ({ title: "asc" } as const)
      : sort === "published_desc"
      ? ({ publishedAt: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const postsRaw = await prisma.blogPost.findMany({
    where,
    orderBy,
  });

  const posts = (
    q
      ? filterByArabicSearch(postsRaw, q, [
          (post) => post.title,
          (post) => post.category,
          (post) => post.slug,
          (post) => post.excerpt,
        ])
      : postsRaw
  ).slice(0, adminListLimits.blog);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="page-header-title">{t("title")}</h1>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("newPost")}</h2>
        <ActionForm action={createBlogPost} locale={locale} className="space-y-4">
          <AdminFormField label={tFields("title")} htmlFor="new-post-title">
            <Input id="new-post-title" name="title" className="w-full" required />
          </AdminFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField label={tFields("category")} htmlFor="new-post-category">
              <Input
                id="new-post-category"
                name="category"
                placeholder={tFields("categoryPlaceholder")}
                className="w-full"
              />
            </AdminFormField>

            <AdminFormField label={tFields("excerpt")} htmlFor="new-post-excerpt">
              <Input id="new-post-excerpt" name="excerpt" className="w-full" required />
            </AdminFormField>
          </div>

          <AdminFormField label={tFields("content")} htmlFor="new-post-content">
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
            className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {tActions("createDraft")}
          </button>
        </ActionForm>
      </Card>
      <AdminFilterCard title={filters.blog.title}>
        <AdminFormField label={filters.search} htmlFor="blog-filter-q">
          <Input
            id="blog-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.blog.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={tFields("publishStatus")}>
          <FilterSelect
            name="status"
            value={status}
            options={[
              { value: "", label: tFilters("allStatuses") },
              { value: "published", label: tFilters("publishedYes") },
              { value: "draft", label: tFilters("publishedNo") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "published_desc", label: filters.sortPublishedDesc },
              { value: "title_asc", label: filters.sortTitleAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {posts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noBlog")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-heading">{post.title}</p>
                  <p className="text-sm text-text/70">{post.category}</p>
                  <p className="text-xs text-text/60">
                    {post.isPublished && post.publishedAt
                      ? tMisc("publishedAt", {
                          date: formatDate(post.publishedAt, locale),
                        })
                      : tMisc("draft")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/blog/${post.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {tActions("edit")}
                  </Link>
                  <ActionForm action={togglePublish} locale={locale}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {post.isPublished
                        ? tActions("unpublish")
                        : tActions("publish")}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={posts.length}
            limit={adminListLimits.blog}
          />
        </div>
      )}
    </div>
  );
}
