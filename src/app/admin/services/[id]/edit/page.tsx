import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PUBLIC_INVALIDATIONS } from "@/lib/revalidate-public-content";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import {
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
import { adminUrl } from "@/lib/admin-path";
import { getActionLocale } from "@/lib/action-locale";
import { getUserRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const fieldClass = "w-full";

function parseEurosToCents(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();
  const euros = Number(normalized);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

async function updateService(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const locale = await getActionLocale();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const duration = Number(String(formData.get("duration") || ""));
  const priceCents = parseEurosToCents(String(formData.get("price") || ""));

  if (!id || !title || !description || !Number.isFinite(duration) || duration <= 0) {
    return incomplete(locale);
  }
  if (priceCents === null) return incomplete(locale);

  return runAction(
    locale,
    async () => {
      const service = await prisma.service.findUnique({ where: { id } });
      if (!service) throw new Error("NOT_FOUND");

      await prisma.service.update({
        where: { id },
        data: {
          title,
          description,
          duration,
          price: priceCents,
        },
      });

      revalidatePath("/admin/services");
      PUBLIC_INVALIDATIONS.services(service.slug);
    },
    "updated",
    adminUrl(`/services/${id}/edit`)
  );
}

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const locale = (await getLocale()) as AppLocale;
  const [t, tFields, tActions, tStatuses, tCommon] = await Promise.all([
    getTranslations("adminPages.services"),
    getTranslations("adminPages.fields"),
    getTranslations("adminPages.actions"),
    getTranslations("adminPages.statuses"),
    getTranslations("admin.common"),
  ]);

  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!service) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t("editTitle")}</h1>
          <p className="mt-1 text-xs text-text/50" dir="ltr">
            /services/{service.slug}
          </p>
          <p className="text-xs text-text/60">
            {t("editMeta", {
              count: service._count.bookings,
              status: service.isActive
                ? tStatuses("active")
                : tStatuses("inactive"),
            })}
          </p>
        </div>
        <Link
          href={adminUrl("/services")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
        >
          {tCommon("back")}
        </Link>
      </div>

      <Card>
        <ActionForm action={updateService} locale={locale} className="space-y-4">
          <input type="hidden" name="id" value={service.id} />

          <AdminFormField label={tFields("title")} htmlFor="service-title">
            <Input
              id="service-title"
              name="title"
              defaultValue={service.title}
              className={fieldClass}
              required
            />
          </AdminFormField>

          <AdminFormField
            label={tFields("description")}
            htmlFor="service-description"
            hint={tFields("descriptionHint")}
          >
            <Textarea
              id="service-description"
              name="description"
              rows={5}
              defaultValue={service.description}
              className={fieldClass}
              required
            />
          </AdminFormField>

          <div className="grid gap-4 sm:grid-cols-2">
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
                defaultValue={service.duration}
                className={fieldClass}
                required
              />
            </AdminFormField>

            <AdminFormField
              label={tFields("priceEuro")}
              htmlFor="service-price"
              hint={tFields("currentPrice", {
                price: formatPrice(service.price, "EUR", locale),
              })}
            >
              <Input
                id="service-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={(service.price / 100).toFixed(2)}
                className={fieldClass}
                required
              />
            </AdminFormField>
          </div>

          <AdminFormActions>
            <AdminPrimaryButton>{tActions("save")}</AdminPrimaryButton>
            <Link
              href={`/services/${service.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
            >
              {tActions("previewPage")}
            </Link>
          </AdminFormActions>
        </ActionForm>
      </Card>
    </div>
  );
}
