import type { Metadata } from "next";
import { Clock, Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getPublicServices } from "@/lib/services";
import { intlLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/services"),
  };
}

export default async function ServicesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("services");
  const services = await getPublicServices(locale);
  const priceLocale = intlLocale(locale);

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.slug} hoverable className="flex flex-col">
              <CardTitle>{service.title}</CardTitle>
              <CardDescription className="flex-1">
                {service.description}
              </CardDescription>
              <div className="mt-6 mb-4 flex items-center gap-4 text-sm text-text/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration}
                </span>
                <span className="text-lg font-semibold text-primary">
                  {formatPrice(service.price, "EUR", priceLocale)}
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {service.results.map((result) => (
                  <li
                    key={result}
                    className="flex items-start gap-2 text-sm text-text"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {result}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href={`/booking?service=${service.slug}`}
                  className="flex-1 text-center"
                >
                  {t("bookNow")}
                </ButtonLink>
                <ButtonLink
                  href={`/services/${service.slug}`}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-center"
                >
                  {t("learnMore")}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </ContentSection>
    </>
  );
}
