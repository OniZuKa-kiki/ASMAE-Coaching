import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { getPublicServiceBySlug, getActiveServices } from "@/lib/services";
import { intlLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("services");
  const service = await getPublicServiceBySlug(slug, locale);
  if (!service) return { title: t("notFound") };
  return {
    title: service.title,
    description: service.description,
    alternates: localeAlternates(`/services/${slug}`),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("services");
  const service = await getPublicServiceBySlug(slug, locale);
  if (!service) notFound();

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
          {t("eyebrow")}
        </p>
        <h1 className="page-title mb-6">{service.title}</h1>
        <p className="text-base sm:text-lg lg:text-xl text-text/80 mb-8">
          {service.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 p-4 sm:p-6 rounded-[20px] bg-card border border-border/50">
          <div className="flex items-center gap-2 text-text">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span>{service.duration}</span>
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-semibold text-primary">
            {formatPrice(service.price, "EUR", intlLocale(locale))}
          </div>
        </div>

        <h2 className="font-heading text-2xl font-semibold text-heading mb-4">
          {t("expectedResults")}
        </h2>
        <ul className="space-y-3 mb-10">
          {service.results.map((result) => (
            <li key={result} className="flex items-start gap-3 text-text">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              {result}
            </li>
          ))}
        </ul>

        <ButtonLink href={`/booking?service=${service.slug}`} size="lg">
          {t("bookNow")}
        </ButtonLink>
      </div>
    </section>
  );
}
