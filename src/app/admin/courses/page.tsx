import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { RecommendationTopicsField } from "@/components/admin/recommendation-topics-field";
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
import { formatPrice } from "@/lib/utils";
import {
  parseRecommendationTopicsFromForm,
  formatRecommendationTopicLabels,
  resolveCourseTopicsForSave,
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

async function createCourse(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceRaw = String(formData.get("price") || "").trim();
  if (!title || !description || !priceRaw) return incomplete(locale);

  const price = Number(priceRaw);
  if (!Number.isFinite(price)) return incomplete(locale);
  const topics = parseRecommendationTopicsFromForm(formData);

  return runAction(locale, async () => {
    const baseSlug = slugify(title);
    const exists = await prisma.course.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const resolvedTopics = await resolveCourseTopicsForSave(slug, title, description, topics);

    await prisma.course.create({
      data: {
        slug,
        title,
        description,
        price,
        topics: resolvedTopics,
        isPublished: false,
      },
    });

    revalidatePath("/admin/courses");
    PUBLIC_INVALIDATIONS.courses();
    revalidatePath("/dashboard");
  }, "created");
}

async function toggleCoursePublish(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new Error("NOT_FOUND");

    await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    revalidatePath("/admin/courses");
    PUBLIC_INVALIDATIONS.courses();
  }, "toggled");
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
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.courses"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const published = getQueryValue(params.published).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(published === "yes"
      ? { isPublished: true }
      : published === "no"
      ? { isPublished: false }
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

  const coursesRaw = await prisma.course.findMany({
    where,
    include: {
      modules: true,
      enrollments: true,
    },
    orderBy,
  });

  const courses = (
    q
      ? filterByArabicSearch(coursesRaw, q, [
          (course) => course.title,
          (course) => course.slug,
          (course) => course.description,
        ])
      : coursesRaw
  ).slice(0, adminListLimits.courses);

  const topicOptions = getAdminRecommendationTopicOptions(locale);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>

      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("newCourse")}</h2>
        <ActionForm action={createCourse} locale={locale} className="space-y-4">
          <AdminFormField label={tFields("title")} htmlFor="new-course-title">
            <Input id="new-course-title" name="title" className="w-full" required />
          </AdminFormField>

          <AdminFormField label={tFields("description")} htmlFor="new-course-description">
            <Textarea
              id="new-course-description"
              name="description"
              rows={4}
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("priceCents")}
            htmlFor="new-course-price"
            hint={tFields("priceCentsHint")}
          >
            <Input
              id="new-course-price"
              name="price"
              type="number"
              min="0"
              className="w-full"
              required
            />
          </AdminFormField>

          <RecommendationTopicsField
            label={tFields("recommendationTopics")}
            hint={tFields("recommendationTopicsHint")}
          />

          <div>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {tActions("createDraft")}
            </button>
          </div>
        </ActionForm>
      </Card>
      <AdminFilterCard title={filters.courses.title}>
        <AdminFormField label={filters.search} htmlFor="course-filter-q">
          <Input
            id="course-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.courses.searchPlaceholder}
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
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: filters.sortNewest },
              { value: "title_asc", label: filters.sortTitleAsc },
              { value: "price_desc", label: filters.sortPriceDesc },
              { value: "price_asc", label: filters.sortPriceAsc },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {courses.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noCourses")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-heading">{course.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text/70">
                    <span className="font-semibold text-primary">
                      {formatPrice(course.price, "EUR", locale)}
                    </span>
                    <span>{tMisc("modulesCount", { count: course.modules.length })}</span>
                    <span>
                      {tMisc("enrollmentsCount", { count: course.enrollments.length })}
                    </span>
                    {course.topics.length > 0 ? (
                      <span>
                        {formatRecommendationTopicLabels(course.topics, topicOptions)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={adminUrl(`/courses/${course.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {tActions("edit")}
                  </Link>
                  <ActionForm action={toggleCoursePublish} locale={locale}>
                    <input type="hidden" name="id" value={course.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {course.isPublished
                        ? tActions("unpublish")
                        : tActions("publish")}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={courses.length}
            limit={adminListLimits.courses}
          />
        </div>
      )}
    </div>
  );
}
