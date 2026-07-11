import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import { Problems } from "@/components/home/problems";
import { Method } from "@/components/home/method";
import { TestimonialsPreview } from "@/components/home/testimonials-preview";
import { Stats } from "@/components/home/stats";
import { FAQ } from "@/components/home/faq";
import { FinalCTA } from "@/components/home/final-cta";
import { getVisibleTestimonials } from "@/lib/content";
import { localeAlternates } from "@/lib/seo";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("siteTitle"),
    description: t("description"),
    alternates: localeAlternates("/"),
  };
}

export default async function HomePage() {
  const testimonials = await getVisibleTestimonials();

  return (
    <>
      <Hero />
      <Problems />
      <Method />
      <TestimonialsPreview testimonials={testimonials} />
      <Stats />
      <FAQ />
      <FinalCTA />
    </>
  );
}
