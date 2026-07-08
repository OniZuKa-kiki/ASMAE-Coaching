import { Hero } from "@/components/home/hero";
import { Problems } from "@/components/home/problems";
import { Method } from "@/components/home/method";
import { TestimonialsPreview } from "@/components/home/testimonials-preview";
import { Stats } from "@/components/home/stats";
import { FAQ } from "@/components/home/faq";
import { FinalCTA } from "@/components/home/final-cta";
import { getVisibleTestimonials } from "@/lib/content";

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
