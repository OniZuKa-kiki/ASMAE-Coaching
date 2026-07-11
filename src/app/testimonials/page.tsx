import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { TestimonialsPageList } from "@/components/testimonials/testimonials-page-list";
import { getVisibleTestimonials } from "@/lib/content";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

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
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
        <TestimonialsPageList
          testimonials={testimonials.map((testimonial) => ({
            id: testimonial.id,
            name: testimonial.name,
            role: testimonial.role,
            content: testimonial.content,
            rating: testimonial.rating,
          }))}
        />
      </ContentSection>

      <ContentSection variant="band">
        <div className="text-center">
          <SectionHeading title={t("ctaTitle")} subtitle={t("ctaSubtitle")} />
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </ContentSection>
    </>
  );
}
