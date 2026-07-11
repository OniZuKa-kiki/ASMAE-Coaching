import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { BookingForm } from "@/components/booking/booking-form";
import { getActiveServices } from "@/lib/services";

export async function generateMetadata() {
  const t = await getTranslations("booking");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/booking"),
  };
}

export default async function BookingPage() {
  const [services, t, tCommon] = await Promise.all([
    getActiveServices(),
    getTranslations("booking"),
    getTranslations("common"),
  ]);

  return (
    <>
      <PageHero
        title={t("title")}
        subtitle={t("subtitle")}
        className="!pb-8 sm:!pb-12 lg:!pb-16"
      />

      <ContentSection tightTop>
        <Suspense
          fallback={<div className="text-center">{tCommon("loading")}</div>}
        >
          <BookingForm services={services} />
        </Suspense>
      </ContentSection>
    </>
  );
}
