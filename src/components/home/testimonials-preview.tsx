"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  TestimonialsCarousel,
  type TestimonialCarouselItem,
} from "@/components/home/testimonials-carousel";

export function TestimonialsPreview({
  testimonials,
}: {
  testimonials: TestimonialCarouselItem[];
}) {
  const t = useTranslations("home.testimonials");

  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-card/50">
      <div className="container-narrow">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
