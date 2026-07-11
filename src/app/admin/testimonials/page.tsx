import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import { Star } from "lucide-react";
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
import { getActionLocale } from "@/lib/action-locale";
import {
  getAdminFilters,
  getAdminPagesCopy,
} from "@/lib/admin-i18n";
import { adminListLimits } from "@/lib/admin-filters";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
import {
  ListScrollHint,
  ListSectionHeader,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import { filterByArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

async function createTestimonial(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const rating = Number(formData.get("rating") || 5);

  if (!name || !content) return incomplete(locale);

  return runAction(locale, async () => {
    await prisma.testimonial.create({
      data: {
        name,
        role: role || null,
        content,
        rating: Math.min(5, Math.max(1, rating)),
        isVisible: false,
      },
    });

    revalidatePath("/admin/testimonials");
    PUBLIC_INVALIDATIONS.testimonials();
  }, "created");
}

async function toggleVisibility(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    const row = await prisma.testimonial.findUnique({ where: { id } });
    if (!row) throw new Error("NOT_FOUND");

    await prisma.testimonial.update({
      where: { id },
      data: { isVisible: !row.isVisible },
    });

    revalidatePath("/admin/testimonials");
    PUBLIC_INVALIDATIONS.testimonials();
  }, "toggled");
}

async function deleteTestimonial(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath("/admin/testimonials");
    PUBLIC_INVALIDATIONS.testimonials();
  }, "deleted");
}

async function importSessionReview(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const copy = getAdminPagesCopy(locale);
  const reviewId = String(formData.get("reviewId") || "");
  if (!reviewId) return incomplete(locale);

  return runAction(locale, async () => {
    const review = await prisma.bookingReview.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
        booking: { include: { service: true } },
        testimonial: true,
      },
    });
    if (!review) throw new Error("NOT_FOUND");
    if (review.testimonial) {
      throw new Error(copy.errors.reviewAlreadyImported);
    }

    const name =
      [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") ||
      copy.misc.clientFallback;
    const content =
      review.comment?.trim() ||
      copy.testimonials.defaultReviewContent.replace(
        "{service}",
        review.booking.service.title
      );

    await prisma.testimonial.create({
      data: {
        name,
        role: review.booking.service.title,
        content,
        rating: review.rating,
        isVisible: false,
        sourceReviewId: review.id,
      },
    });

    revalidatePath("/admin/testimonials");
    PUBLIC_INVALIDATIONS.testimonials();
  }, "created");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.testimonials"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);
  const ratingOptions = [5, 4, 3, 2, 1].map((value) => ({
    value: String(value),
    label: t("stars", { count: value }),
  }));

  const q = getQueryValue(params.q).trim();
  const visibility = getQueryValue(params.visibility).trim();
  const sort = getQueryValue(params.sort, "newest");

  const where = {
    ...(visibility === "visible"
      ? { isVisible: true }
      : visibility === "hidden"
      ? { isVisible: false }
      : {}),
  };

  const orderBy =
    sort === "oldest"
      ? ({ createdAt: "asc" } as const)
      : sort === "rating_desc"
      ? ({ rating: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const [testimonialsRaw, pendingReviews] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy,
    }),
    prisma.bookingReview.findMany({
      where: { testimonial: null },
      include: {
        user: true,
        booking: { include: { service: true } },
      },
      orderBy: { createdAt: "desc" },
      take: adminListLimits.sessionReviews,
    }),
  ]);

  const testimonials = (
    q
      ? filterByArabicSearch(testimonialsRaw, q, [
          (row) => row.name,
          (row) => row.role,
          (row) => row.content,
        ])
      : testimonialsRaw
  ).slice(0, adminListLimits.blog);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("title")}</h1>

      <Card className="mb-8">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("addTestimonial")}</h2>
        <ActionForm action={createTestimonial} locale={locale} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminFormField label={tFields("name")} htmlFor="testimonial-name">
              <Input id="testimonial-name" name="name" required className="w-full" />
            </AdminFormField>
            <AdminFormField label={tFields("roleContext")} htmlFor="testimonial-role">
              <Input id="testimonial-role" name="role" className="w-full" />
            </AdminFormField>
          </div>
          <AdminFormField label={tFields("rating")} htmlFor="testimonial-rating">
            <select
              id="testimonial-rating"
              name="rating"
              defaultValue="5"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label={tFields("testimonialText")} htmlFor="testimonial-content">
            <Textarea
              id="testimonial-content"
              name="content"
              rows={4}
              required
              className="w-full"
            />
          </AdminFormField>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-hover"
          >
            {tActions("saveAsDraft")}
          </button>
        </ActionForm>
      </Card>

      {pendingReviews.length > 0 ? (
        <Card className="mb-8 border-primary/15 bg-primary/5">
          <ListSectionHeader
            title={t("sessionReviewsTitle")}
            count={pendingReviews.length}
            className="mb-2"
          />
          <p className="mb-4 text-sm text-text/70">{t("sessionReviewsHint")}</p>
          <ScrollableItemList
            count={pendingReviews.length}
            maxHeightClassName="max-h-80 sm:max-h-96"
          >
            {pendingReviews.map((review) => {
              const clientName =
                [review.user.firstName, review.user.lastName]
                  .filter(Boolean)
                  .join(" ") || tMisc("clientFallback");

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-border/60 bg-card px-4 py-3"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-heading">{clientName}</span>
                    <span className="text-sm text-text/60">
                      {tMisc("bookingsCountSeparator")}
                      {review.booking.service.title}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-600">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mb-3 text-sm text-text/80">{review.comment}</p>
                  ) : null}
                  <ActionForm action={importSessionReview} locale={locale}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <button
                      type="submit"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {tActions("importReview")}
                    </button>
                  </ActionForm>
                </div>
              );
            })}
          </ScrollableItemList>
          <AdminListLimitNotice
            shown={pendingReviews.length}
            limit={adminListLimits.sessionReviews}
          />
        </Card>
      ) : null}

      <AdminFilterCard title={t("filterTitle")}>
        <AdminFormField label={filters.search} htmlFor="q">
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
        </AdminFormField>
        <AdminFormField label={tFields("visibility")} htmlFor="visibility">
          <FilterSelect
            name="visibility"
            value={visibility}
            options={[
              { value: "", label: tFilters("visibilityAll") },
              { value: "visible", label: tFilters("visibilityVisible") },
              { value: "hidden", label: tFilters("visibilityHidden") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort} htmlFor="sort">
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "newest", label: filters.sortNewest },
              { value: "oldest", label: filters.sortOldest },
              { value: "rating_desc", label: tFilters("sortRatingDesc") },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      <div className="mt-6">
        <ListScrollHint count={testimonials.length} className="mb-4" />
        <ScrollableItemList count={testimonials.length}>
          {testimonials.length === 0 ? (
            <Card className="py-10 text-center">
              <p className="text-text/70">{tEmpty("noTestimonials")}</p>
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-heading">{testimonial.name}</h3>
                      {testimonial.role ? (
                        <span className="text-sm text-text/60">
                          {tMisc("bookingsCountSeparator")}
                          {testimonial.role}
                        </span>
                      ) : null}
                      <span
                        className={
                          testimonial.isVisible
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {testimonial.isVisible
                          ? tFilters("visibilityVisible")
                          : tFilters("visibilityHidden")}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-0.5 text-amber-600">
                      {Array.from({ length: testimonial.rating }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-text/80">
                      {testimonial.content}
                    </p>
                    <p className="mt-2 text-xs text-text/50">
                      {formatDate(testimonial.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ActionForm action={toggleVisibility} locale={locale}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary"
                      >
                        {testimonial.isVisible
                          ? tActions("hide")
                          : tActions("publish")}
                      </button>
                    </ActionForm>
                    <ActionForm action={deleteTestimonial} locale={locale}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        {tActions("delete")}
                      </button>
                    </ActionForm>
                  </div>
                </div>
              </Card>
            ))
          )}
        </ScrollableItemList>
      </div>

      <AdminListLimitNotice
        shown={testimonials.length}
        limit={adminListLimits.blog}
      />
    </div>
  );
}
