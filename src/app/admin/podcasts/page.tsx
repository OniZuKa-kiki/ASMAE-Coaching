import { revalidatePath } from "next/cache";
import Link from "next/link";
import { AdminFormField } from "@/components/admin/form-field";
import {
  AdminDangerButton,
  AdminFormActions,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
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

async function createPodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = String(formData.get("duration") || "").trim();
  const isPremium = String(formData.get("isPremium") || "") === "on";

  if (!title || !description) return incomplete("ar");

  return runAction("ar", async () => {
    const baseSlug = slugify(title);
    const exists = await prisma.podcast.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const duration = durationRaw ? Number(durationRaw) : null;

    await prisma.podcast.create({
      data: {
        slug,
        title,
        description,
        audioUrl: audioUrl || null,
        duration: Number.isFinite(duration) ? duration : null,
        isPremium,
        isPublished: false,
      },
    });

    revalidatePath("/admin/podcasts");
    revalidatePath("/podcasts");
  }, "created");
}

async function togglePodcastState(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const field = String(formData.get("field") || "");
  if (!id || !field) return incomplete("ar");

  return runAction("ar", async () => {
    const podcast = await prisma.podcast.findUnique({ where: { id } });
    if (!podcast) throw new Error(adminErrors.notFound);

    if (field === "publish") {
      await prisma.podcast.update({
        where: { id },
        data: { isPublished: !podcast.isPublished },
      });
    } else if (field === "premium") {
      await prisma.podcast.update({
        where: { id },
        data: { isPremium: !podcast.isPremium },
      });
    } else {
      throw new Error(adminErrors.notFound);
    }

    revalidatePath("/admin/podcasts");
    revalidatePath("/podcasts");
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminPodcastsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const published = getQueryValue(params.published).trim();
  const premium = getQueryValue(params.premium).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(published === "yes"
      ? { isPublished: true }
      : published === "no"
      ? { isPublished: false }
      : {}),
    ...(premium === "yes"
      ? { isPremium: true }
      : premium === "no"
      ? { isPremium: false }
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
      : sort === "duration_desc"
      ? ({ duration: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const podcasts = await prisma.podcast.findMany({
    where,
    orderBy,
    take: 50,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        البودكاست
      </h1>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">بودكاست جديد</h2>
        <p className="text-sm text-text/70 mb-4">
          `audioUrl` = رابط مباشر لملف صوتي (مثال: `.mp3`/`.m4a`).
          يمكنك الحصول عليه برفع الملف على Supabase Storage
          أو Cloudinary أو BunnyCDN أو S3، ثم نسخ الرابط العام.
        </p>
        <ActionForm action={createPodcast} locale="ar" className="space-y-4">
          <AdminFormField label="عنوان الحلقة" htmlFor="new-podcast-title">
            <Input
              id="new-podcast-title"
              name="title"
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField label="الوصف" htmlFor="new-podcast-description">
            <Textarea
              id="new-podcast-description"
              name="description"
              rows={3}
              className="w-full"
              required
            />
          </AdminFormField>

          <MediaUrlField
            mediaType="audio"
            urlName="audioUrl"
            durationName="duration"
            label="رابط الملف الصوتي"
            hint="رابط مباشر (.mp3 أو .m4a)."
          />

          <label className="inline-flex items-center gap-2 text-sm text-text">
            <input type="checkbox" name="isPremium" />
            محتوى مميز (للمشتركين فقط)
          </label>
          <AdminFormActions>
            <AdminPrimaryButton>إنشاء مسودة</AdminPrimaryButton>
          </AdminFormActions>
        </ActionForm>
      </Card>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">تصفية القائمة</h2>
        <form method="GET" className="grid md:grid-cols-5 gap-4">
          <AdminFormField label="بحث" htmlFor="podcast-filter-q">
            <Input
              id="podcast-filter-q"
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
                { value: "yes", label: "منشور" },
                { value: "no", label: "مسودات" },
              ]}
            />
          </AdminFormField>
          <AdminFormField label="نوع المحتوى">
            <FilterSelect
              name="premium"
              value={premium}
              options={[
                { value: "", label: "مميز + مجاني" },
                { value: "yes", label: "مميز" },
                { value: "no", label: "مجاني" },
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
                { value: "duration_desc", label: "المدة ↓" },
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

      {podcasts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">لا يوجد بودكاست حالياً.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{podcast.title}</p>
                  <p className="text-sm text-text/70">
                    /podcasts/{podcast.slug} • {podcast.duration ?? "—"} د
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/podcasts/${podcast.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    تعديل
                  </Link>
                  <ActionForm action={togglePodcastState} locale="ar">
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="premium" />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                    >
                      {podcast.isPremium ? "إزالة المميز" : "جعله مميزاً"}
                    </button>
                  </ActionForm>
                  <ActionForm action={togglePodcastState} locale="ar">
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="publish" />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {podcast.isPublished ? "إلغاء النشر" : "نشر"}
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
