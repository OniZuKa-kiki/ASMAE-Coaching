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

async function updateBlogPost(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim() || "Coaching";
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!id || !title || !excerpt || !content) return;

  const baseSlug = slugify(title);
  const conflict = await prisma.blogPost.findFirst({
    where: { slug: baseSlug, id: { not: id } },
    select: { id: true },
  });
  const slug = conflict ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  await prisma.blogPost.update({
    where: { id },
    data: { title, category, excerpt, content, slug },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

async function deleteBlogPost(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Modifier l&apos;article
          </h1>
          <p className="text-sm text-text/70 mt-1">Slug: {post.slug}</p>
        </div>
        <Link
          href="/admin/blog"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <Card>
        <form action={updateBlogPost} className="space-y-3">
          <input type="hidden" name="id" value={post.id} />
          <input
            name="title"
            defaultValue={post.title}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="category"
              defaultValue={post.category}
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <input
              name="excerpt"
              defaultValue={post.excerpt}
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
              required
            />
          </div>
          <textarea
            name="content"
            defaultValue={post.content}
            rows={10}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="submit"
              formAction={deleteBlogPost}
              className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

