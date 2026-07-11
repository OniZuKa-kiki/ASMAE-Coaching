import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PUBLIC_CONTENT_REVALIDATE_SECONDS } from "@/lib/public-cache";

export const revalidate = PUBLIC_CONTENT_REVALIDATE_SECONDS;
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { TestimonialsPageList } from "@/components/testimonials/testimonials-page-list";
import { getVisibleTestimonials } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("testimonials");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/testimonials"),
  };
}

export default async function TestimonialsPage() {
  const [testimonials, t] = await Promise.all([
    getVisibleTestimonials(),
    getTranslations("testimonials"),
  ]);

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <TestimonialsPageList
            testimonials={testimonials.map((testimonial) => ({
              id: testimonial.id,
              name: testimonial.name,
              role: testimonial.role,
              content: testimonial.content,
              rating: testimonial.rating,
            }))}
          />
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow text-center">
          <SectionHeading
            title={t("ctaTitle")}
            subtitle={t("ctaSubtitle")}
          />
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
