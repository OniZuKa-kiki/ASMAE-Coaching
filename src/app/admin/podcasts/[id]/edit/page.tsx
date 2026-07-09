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
import { MediaUrlField } from "@/components/admin/media-url-field";
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

const fieldClass = "w-full";

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

async function updatePodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = Number(String(formData.get("duration") || ""));
  const isPremium = String(formData.get("isPremium") || "") === "on";
  const isPublished = String(formData.get("isPublished") || "") === "on";

  if (!id || !title || !description) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      const baseSlug = slugify(title);
      const conflict = await prisma.podcast.findFirst({
        where: { slug: baseSlug, id: { not: id } },
        select: { id: true },
      });
      const slug = conflict ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

      await prisma.podcast.update({
        where: { id },
        data: {
          title,
          description,
          slug,
          audioUrl: audioUrl || null,
          duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
          isPremium,
          isPublished,
        },
      });

      revalidatePath("/admin/podcasts");
      revalidatePath("/podcasts");
    },
    "updated",
    adminUrl("/podcasts")
  );
}

async function deletePodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("ar");

  return runAction(
    "ar",
    async () => {
      await prisma.podcast.delete({ where: { id } });
      revalidatePath("/admin/podcasts");
      revalidatePath("/podcasts");
    },
    "deleted",
    adminUrl("/podcasts")
  );
}

export default async function AdminPodcastEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const podcast = await prisma.podcast.findUnique({ where: { id } });
  if (!podcast) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">تعديل البودكاست</h1>
          <p className="text-sm text-text/70 mt-1">الرابط: /podcasts/{podcast.slug}</p>
        </div>
        <Link
          href={adminUrl("/podcasts")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card>
        <ActionForm action={updatePodcast} locale="ar" className="space-y-4" id={`podcast-update-${podcast.id}`}>
          <input type="hidden" name="id" value={podcast.id} />

          <AdminFormField label="عنوان الحلقة" htmlFor="podcast-title">
            <Input
              id="podcast-title"
              name="title"
              defaultValue={podcast.title}
              className={fieldClass}
              required
            />
          </AdminFormField>

          <AdminFormField
            label="الوصف"
            htmlFor="podcast-description"
            hint="نبذة قصيرة تظهر في صفحة البودكاست."
          >
            <Textarea
              id="podcast-description"
              name="description"
              defaultValue={podcast.description}
              rows={5}
              className={fieldClass}
              required
            />
          </AdminFormField>

          <MediaUrlField
            mediaType="audio"
            urlName="audioUrl"
            durationName="duration"
            label="رابط الملف الصوتي"
            defaultUrl={podcast.audioUrl ?? ""}
            defaultDuration={podcast.duration}
            hint="رابط مباشر (.mp3 أو .m4a)."
          />

          <div className="flex flex-wrap gap-6 text-sm text-text pt-1">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isPremium" defaultChecked={podcast.isPremium} />
              <span>محتوى مميز (للمشتركين فقط)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked={podcast.isPublished} />
              <span>منشور على الموقع</span>
            </label>
          </div>
        </ActionForm>

        <AdminFormActions className="mt-4 pt-4 border-t border-border/50">
          <AdminPrimaryButton form={`podcast-update-${podcast.id}`}>
            حفظ التعديلات
          </AdminPrimaryButton>
          <ActionForm action={deletePodcast} locale="ar" className="inline-flex">
            <input type="hidden" name="id" value={podcast.id} />
            <AdminDangerButton>حذف البودكاست</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>
    </div>
  );
}
