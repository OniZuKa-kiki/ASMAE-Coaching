import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminFormField } from "@/components/admin/form-field";
import {
  AdminDangerButton,
  AdminFormActions,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
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

async function updateBlogPost(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim() || "Coaching";
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!id || !title || !excerpt || !content) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
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
    },
    "updated",
    adminUrl("/blog")
  );
}

async function deleteBlogPost(formData: FormData): Promise<ActionResult> {
  "use server";
  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.blogPost.delete({ where: { id } });
      revalidatePath("/admin/blog");
      revalidatePath("/blog");
    },
    "deleted",
    adminUrl("/blog")
  );
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
          <h1 className="page-header-title">تعديل المقال</h1>
          <p className="text-sm text-text/70 mt-1">الرابط: /blog/{post.slug}</p>
        </div>
        <Link
          href={adminUrl("/blog")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card>
        <ActionForm action={updateBlogPost} locale="ar" className="space-y-4" id={`blog-update-${post.id}`}>
          <input type="hidden" name="id" value={post.id} />

          <AdminFormField label="عنوان المقال" htmlFor="post-title">
            <Input
              id="post-title"
              name="title"
              defaultValue={post.title}
              className="w-full"
              required
            />
          </AdminFormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <AdminFormField label="الفئة" htmlFor="post-category" hint="مثال: الرفاهية، العلاقات">
              <Input
                id="post-category"
                name="category"
                defaultValue={post.category}
                className="w-full"
              />
            </AdminFormField>

            <AdminFormField label="ملخص قصير" htmlFor="post-excerpt" hint="يظهر في قائمة المدونة.">
              <Input
                id="post-excerpt"
                name="excerpt"
                defaultValue={post.excerpt}
                className="w-full"
                required
              />
            </AdminFormField>
          </div>

          <AdminFormField label="محتوى المقال" htmlFor="post-content">
            <Textarea
              id="post-content"
              name="content"
              defaultValue={post.content}
              rows={10}
              className="w-full"
              required
            />
          </AdminFormField>

        </ActionForm>

        <AdminFormActions className="mt-4 pt-4 border-t border-border/50">
          <AdminPrimaryButton form={`blog-update-${post.id}`}>
            حفظ التعديلات
          </AdminPrimaryButton>
          <ActionForm action={deleteBlogPost} locale="ar" className="inline-flex">
            <input type="hidden" name="id" value={post.id} />
            <AdminDangerButton>حذف المقال</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>
    </div>
  );
}
