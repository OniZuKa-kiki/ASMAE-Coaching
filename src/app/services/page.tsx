import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getPublicServices } from "@/lib/services";
import { intlLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";
import { PUBLIC_CONTENT_REVALIDATE_SECONDS } from "@/lib/public-cache";

export const revalidate = PUBLIC_CONTENT_REVALIDATE_SECONDS;

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
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">{t("title")}</h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.slug} className="flex flex-col card-hover">
                <CardTitle>{service.title}</CardTitle>
                <CardDescription className="flex-1">
                  {service.description}
                </CardDescription>
                <div className="flex items-center gap-4 mt-6 mb-4 text-sm text-text/70">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </span>
                  <span className="font-semibold text-primary text-lg">
                    {formatPrice(service.price, "EUR", priceLocale)}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {service.results.map((result) => (
                    <li
                      key={result}
                      className="flex items-start gap-2 text-sm text-text"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {result}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ButtonLink
                    href={`/booking?service=${service.slug}`}
                    className="flex-1 text-center"
                  >
                    {t("bookNow")}
                  </ButtonLink>
                  <Link
                    href={`/services/${service.slug}`}
                    className="flex-1 text-center py-3.5 text-sm font-semibold text-primary border-2 border-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {t("learnMore")}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
