import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import Link from "next/link";
import { Clock, Euro } from "lucide-react";
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
import { filterByArabicSearch } from "@/lib/search-utils";
import { formatPrice } from "@/lib/utils";
import { AdminFilterCard } from "@/components/admin/filter-card";
import { AdminListLimitNotice } from "@/components/admin/list-limit-notice";
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

function parseEurosToCents(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();
  const euros = Number(normalized);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

async function createService(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const title = String(formData.get("title") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const duration = Number(String(formData.get("duration") || ""));
  const priceCents = parseEurosToCents(String(formData.get("price") || ""));

  const slug = slugRaw ? slugify(slugRaw) : slugify(title);
  if (!title || !description || !slug || !Number.isFinite(duration) || duration <= 0) {
    return incomplete(locale);
  }
  if (priceCents === null) return incomplete(locale);

  return runAction(locale, async () => {
    const exists = await prisma.service.findUnique({ where: { slug } });
    if (exists) throw new Error("SLUG_TAKEN");

    await prisma.service.create({
      data: {
        slug,
        title,
        description,
        duration,
        price: priceCents,
        isActive: true,
      },
    });

    revalidatePath("/admin/services");
    PUBLIC_INVALIDATIONS.services(slug);
  }, "created");
}

async function toggleService(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(locale, async () => {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new Error("NOT_FOUND");

    await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });

    revalidatePath("/admin/services");
    PUBLIC_INVALIDATIONS.services(service.slug);
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = (await getLocale()) as AppLocale;
  const [params, t, tFilters, tFields, tActions, tStatuses, tEmpty, tMisc] =
    await Promise.all([
      searchParams,
      getTranslations("adminPages.services"),
      getTranslations("adminPages.filters"),
      getTranslations("adminPages.fields"),
      getTranslations("adminPages.actions"),
      getTranslations("adminPages.statuses"),
      getTranslations("adminPages.empty"),
      getTranslations("adminPages.misc"),
    ]);
  const filters = getAdminFilters(locale);

  const q = getQueryValue(params.q).trim();
  const active = getQueryValue(params.active).trim();
  const sort = getQueryValue(params.sort, "title_asc");

  const where = {
    ...(active === "yes"
      ? { isActive: true }
      : active === "no"
      ? { isActive: false }
      : {}),
  };

  const orderBy =
    sort === "price_desc"
      ? ({ price: "desc" } as const)
      : sort === "price_asc"
      ? ({ price: "asc" } as const)
      : sort === "created_desc"
      ? ({ createdAt: "desc" } as const)
      : ({ title: "asc" } as const);

  const servicesRaw = await prisma.service.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { bookings: true } },
    },
  });

  const services = (
    q
      ? filterByArabicSearch(servicesRaw, q, [
          (service) => service.title,
          (service) => service.slug,
          (service) => service.description,
        ])
      : servicesRaw
  ).slice(0, adminListLimits.services);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="page-header-title">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-text/70">{t("subtitle")}</p>
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-xl text-heading">{t("newService")}</h2>
        <ActionForm
          action={createService}
          locale={locale}
          className="grid gap-4 sm:grid-cols-2"
        >
          <AdminFormField label={tFields("title")} htmlFor="service-title">
            <Input id="service-title" name="title" className="w-full" required />
          </AdminFormField>

          <AdminFormField
            label={tFields("slug")}
            htmlFor="service-slug"
            hint={tFields("slugHint")}
          >
            <Input id="service-slug" name="slug" className="w-full" dir="ltr" />
          </AdminFormField>

          <AdminFormField
            label={tFields("description")}
            htmlFor="service-description"
            className="sm:col-span-2"
          >
            <Textarea
              id="service-description"
              name="description"
              rows={3}
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("durationMinutes")}
            htmlFor="service-duration"
          >
            <Input
              id="service-duration"
              name="duration"
              type="number"
              min="15"
              step="15"
              className="w-full"
              required
            />
          </AdminFormField>

          <AdminFormField label={tFields("priceEuro")} htmlFor="service-price">
            <Input
              id="service-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              className="w-full"
              required
            />
          </AdminFormField>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {tActions("save")}
            </button>
          </div>
        </ActionForm>
      </Card>

      <AdminFilterCard title={filters.services.title}>
        <AdminFormField label={filters.search} htmlFor="service-filter-q">
          <Input
            id="service-filter-q"
            name="q"
            defaultValue={q}
            placeholder={filters.services.searchPlaceholder}
            className="text-sm"
          />
        </AdminFormField>
        <AdminFormField label={tFields("status")}>
          <FilterSelect
            name="active"
            value={active}
            options={[
              { value: "", label: tFilters("activeAll") },
              { value: "yes", label: tStatuses("active") },
              { value: "no", label: tFilters("inactiveLabel") },
            ]}
          />
        </AdminFormField>
        <AdminFormField label={filters.sort}>
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "title_asc", label: filters.sortTitleAsc },
              { value: "price_asc", label: filters.sortPriceAsc },
              { value: "price_desc", label: filters.sortPriceDesc },
              { value: "created_desc", label: filters.sortNewest },
            ]}
          />
        </AdminFormField>
      </AdminFilterCard>

      {services.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tEmpty("noServices")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-heading">{service.title}</p>
                    <span
                      className={
                        service.isActive
                          ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          : "rounded-full bg-border/60 px-2.5 py-0.5 text-xs font-medium text-text/60"
                      }
                    >
                      {service.isActive
                        ? tStatuses("active")
                        : tStatuses("inactive")}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text/80">
                    {service.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {tMisc("durationMinutes", { count: service.duration })}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                      <Euro className="h-4 w-4" />
                      {formatPrice(service.price, "EUR", locale)}
                    </span>
                    <span className="text-xs text-text/60">
                      {tMisc("bookingsCount", { count: service._count.bookings })}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link
                    href={adminUrl(`/services/${service.id}/edit`)}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    {tActions("edit")}
                  </Link>
                  <Link
                    href={`/services/${service.slug}`}
                    className="rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                    target="_blank"
                  >
                    {tActions("preview")}
                  </Link>
                  <ActionForm action={toggleService} locale={locale}>
                    <input type="hidden" name="id" value={service.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      {service.isActive
                        ? tActions("deactivate")
                        : tActions("activate")}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
          <AdminListLimitNotice
            shown={services.length}
            limit={adminListLimits.services}
          />
        </div>
      )}
    </div>
  );
}
