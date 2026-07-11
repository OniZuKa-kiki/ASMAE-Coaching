import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { RecommendationTopicsField } from "@/components/admin/recommendation-topics-field";
import {
  AdminFormActions,
  AdminPrimaryButton,
} from "@/components/admin/form-actions";
import { MediaUrlField } from "@/components/admin/media-url-field";
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
  getAdminRecommendationTopicOptions,
} from "@/lib/admin-i18n";
import { adminListLimits } from "@/lib/admin-filters";
import { prisma } from "@/lib/db";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import { filterByArabicSearch } from "@/lib/search-utils";
import {
  parseRecommendationTopicsFromForm,
  formatRecommendationTopicLabels,
  resolvePodcastTopicsForSave,
} from "@/lib/recommendation-topics-form";
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

async function createPodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = String(formData.get("duration") || "").trim();
  const isPremium = String(formData.get("isPremium") || "") === "on";

  if (!title || !description) return incomplete(locale);
  const topics = parseRecommendationTopicsFromForm(formData);

  return runAction(locale, async () => {
    const baseSlug = slugify(title);
    const exists = await prisma.podcast.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const duration = durationRaw ? Number(durationRaw) : null;
    const resolvedTopics = await resolvePodcastTopicsForSave(slug, title, description, topics);

    await prisma.podcast.create({
      data: {
        slug,
        title,
        description,
        audioUrl: audioUrl || null,
        duration: Number.isFinite(duration) ? duration : null,
        isPremium,
        topics: resolvedTopics,
        isPublished: false,
      },
    });

    revalidatePath("/admin/podcasts");
    PUBLIC_INVALIDATIONS.podcasts();
    revalidatePath("/dashboard");
  }, "created");
}

async function togglePodcastState(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  const field = String(formData.get("field") || "");
  if (!id || !field) return incomplete(locale);

  return runAction(locale, async () => {
    const podcast = await prisma.podcast.findUnique({ where: { id } });
    if (!podcast) throw new Error("NOT_FOUND");

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
      throw new Error("NOT_FOUND");
    }

    revalidatePath("/admin/podcasts");
    PUBLIC_INVALIDATIONS.podcasts();
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
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.podcasts"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

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
  };

  const orderBy =
    sort === "title_asc"
      ? ({ title: "asc" } as const)
      : sort === "duration_desc"
      ? ({ duration: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const podcastsRaw = await prisma.podcast.findMany({
    where,
    orderBy,
  });

  const podcasts = (
    q
      ? filterByArabicSearch(podcastsRaw, q, [
          (podcast) => podcast.title,
          (podcast) => podcast.slug,
          (podcast) => podcast.description,
        ])
      : podcastsRaw
  ).slice(0, adminListLimits.podcasts);

  const topicOptions = getAdminRecommendationTopicOptions(locale);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>
      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("newPodcast")}</h2>
        <p className="mb-4 text-sm text-text/70">{t("audioHelp")}</p>
        <ActionForm action={createPodcast} locale={locale} className="space-y-4">
          <AdminFormField label={tFields("episodeTitle")} htmlFor="new-podcast-title">
            <Input
              id="new-podcast-title"
              name="title"
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField label={tFields("description")} htmlFor="new-podcast-description">
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
            label={tFields("audioUrl")}
            hint={tFields("audioUrlHint")}
          />

          <RecommendationTopicsField
            label={tFields("recommendationTopics")}
            hint={tFields("recommendationTopicsHint")}
          />

          <label className="inline-flex items-center gap-2 text-sm text-text">
            <input type="checkbox" name="isPremium" />
            {tFields("premiumContent")}
          </label>
          <AdminFormActions>
            <AdminPrimaryButton>{tActions("createDraft")}</AdminPrimaryButton>
          </AdminFormActions>
        </ActionForm>
      </Card>
      <AdminFilterCard
        title={filters.podcasts.title}
        formClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        <AdminFormField label={filters.search} htmlFor="podcast-filter-q">
          <Input
            id="podcast-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.podcasts.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={tFields("publishStatus")}>
          <FilterSelect
            name="published"
            value={published}
            options={[
              { value: "", label: tFilters("publishedAll") },
              { value: "yes", label: tFilters("publishedYes") },
              { value: "no", label: tFilters("publishedNo") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={tFields("contentType")}>
          <FilterSelect
            name="premium"
            value={premium}
            options={[
              { value: "", label: tFilters("premiumAll") },
              { value: "yes", label: tFilters("premiumYes") },
              { value: "no", label: tFilters("premiumNo") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "title_asc", label: filters.sortTitleAsc },
              { value: "duration_desc", label: filters.sortDurationDesc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {podcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noPodcasts")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-heading">{podcast.title}</p>
                  <p className="text-sm text-text/70">
                    {podcast.duration
                      ? tMisc("durationMinutes", { count: podcast.duration })
                      : tMisc("noDuration")}
                    {podcast.topics.length > 0
                      ? ` · ${formatRecommendationTopicLabels(podcast.topics, topicOptions)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/podcasts/${podcast.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {tActions("edit")}
                  </Link>
                  <ActionForm action={togglePodcastState} locale={locale}>
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="premium" />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                    >
                      {podcast.isPremium
                        ? tActions("removePremium")
                        : tActions("makePremium")}
                    </button>
                  </ActionForm>
                  <ActionForm action={togglePodcastState} locale={locale}>
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="publish" />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {podcast.isPublished
                        ? tActions("unpublish")
                        : tActions("publish")}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={podcasts.length}
            limit={adminListLimits.podcasts}
          />
        </div>
      )}
    </div>
  );
}
