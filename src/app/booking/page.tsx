import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
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
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center mb-8">
          <h1 className="page-title mb-4">{t("title")}</h1>
          <p className="text-base sm:text-lg lg:text-xl text-text/80">
            {t("subtitle")}
          </p>
        </div>
      </section>
      <section className="section-padding !pt-0">
        <Suspense
          fallback={
            <div className="text-center">{tCommon("loading")}</div>
          }
        >
          <BookingForm services={services} />
        </Suspense>
      </section>
    </>
  );
}
