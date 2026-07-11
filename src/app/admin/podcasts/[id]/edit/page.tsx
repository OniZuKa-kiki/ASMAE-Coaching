import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import {
  AdminDangerButton,
  AdminFormActions,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
import { RecommendationTopicsField } from "@/components/admin/recommendation-topics-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getActionLocale } from "@/lib/action-locale";
import { prisma } from "@/lib/db";
import { parseRecommendationTopicsFromForm, resolvePodcastTopicsForSave } from "@/lib/recommendation-topics-form";
import { getUserRole } from "@/lib/auth";
import type { AppLocale } from "@/i18n/routing";

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

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = Number(String(formData.get("duration") || ""));
  const isPremium = String(formData.get("isPremium") || "") === "on";
  const isPublished = String(formData.get("isPublished") || "") === "on";

  if (!id || !title || !description) return incomplete(locale);
  const topics = parseRecommendationTopicsFromForm(formData);

  return runAction(
    locale,
    async () => {
      const baseSlug = slugify(title);
      const conflict = await prisma.podcast.findFirst({
        where: { slug: baseSlug, id: { not: id } },
        select: { id: true },
      });
      const slug = conflict ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
      const resolvedTopics = await resolvePodcastTopicsForSave(slug, title, description, topics);

      await prisma.podcast.update({
        where: { id },
        data: {
          title,
          description,
          slug,
          audioUrl: audioUrl || null,
          duration:
            Number.isFinite(durationRaw) && durationRaw > 0
              ? Math.round(durationRaw)
              : null,
          isPremium,
          isPublished,
          topics: resolvedTopics,
        },
      });

      revalidatePath("/admin/podcasts");
      PUBLIC_INVALIDATIONS.podcasts();
      revalidatePath("/dashboard");
    },
    "updated",
    adminUrl("/podcasts")
  );
}

async function deletePodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(
    locale,
    async () => {
      await prisma.podcast.delete({ where: { id } });
      revalidatePath("/admin/podcasts");
      PUBLIC_INVALIDATIONS.podcasts();
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

  const locale = (await getLocale()) as AppLocale;
  const [t, tFields, tActions, tCommon] = await Promise.all([
    getTranslations("adminPages.podcasts"),
    getTranslations("adminPages.fields"),
    getTranslations("adminPages.actions"),
    getTranslations("admin.common"),
  ]);

  const { id } = await params;
  const podcast = await prisma.podcast.findUnique({ where: { id } });
  if (!podcast) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("editTitle")}</h1>
          <p className="mt-1 text-sm text-text/70">
            {t("slugPath", { slug: podcast.slug })}
          </p>
        </div>
        <Link
          href={adminUrl("/podcasts")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <Card>
        <ActionForm
          action={updatePodcast}
          locale={locale}
          className="space-y-4"
          id={`podcast-update-${podcast.id}`}
        >
          <input type="hidden" name="id" value={podcast.id} />

          <AdminFormField label={tFields("episodeTitle")} htmlFor="podcast-title">
            <Input
              id="podcast-title"
              name="title"
              defaultValue={podcast.title}
              className={fieldClass}
              required
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("description")}
            htmlFor="podcast-description"
            hint={tFields("podcastDescriptionHint")}
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
            label={tFields("audioUrl")}
            defaultUrl={podcast.audioUrl ?? ""}
            defaultDuration={podcast.duration}
            hint={tFields("audioUrlHint")}
          />

          <RecommendationTopicsField
            selected={podcast.topics}
            label={tFields("recommendationTopics")}
            hint={tFields("recommendationTopicsHint")}
          />

          <div className="flex flex-wrap gap-6 pt-1 text-sm text-text">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="isPremium"
                defaultChecked={podcast.isPremium}
              />
              <span>{tFields("premiumContent")}</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={podcast.isPublished}
              />
              <span>{tFields("publishedOnSite")}</span>
            </label>
          </div>
        </ActionForm>

        <AdminFormActions className="mt-4 border-t border-border/50 pt-4">
          <AdminPrimaryButton form={`podcast-update-${podcast.id}`}>
            {tActions("save")}
          </AdminPrimaryButton>
          <ActionForm action={deletePodcast} locale={locale} className="inline-flex">
            <input type="hidden" name="id" value={podcast.id} />
            <AdminDangerButton>{t("deletePodcast")}</AdminDangerButton>
          </ActionForm>
        </AdminFormActions>
      </Card>
    </div>
  );
}
