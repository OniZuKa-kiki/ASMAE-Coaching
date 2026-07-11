"use client";

import { cn } from "@/lib/utils";
import {
  TestimonialFullCard,
  type TestimonialPageItem,
} from "@/components/testimonials/testimonial-full-card";
import { TestimonialsPageCarousel } from "@/components/testimonials/testimonials-page-carousel";

/** Au-delà de 9 avis (= 3 lignes × 3 colonnes), on passe au carrousel paginé. */
const CAROUSEL_THRESHOLD = 9;

function splitIntoRows<T>(items: T[], perRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }
  return rows;
}

function TestimonialsBalancedGrid({
  testimonials,
}: {
  testimonials: TestimonialPageItem[];
}) {
  const desktopRows = splitIntoRows(testimonials, 3);
  const tabletRows = splitIntoRows(testimonials, 2);

  return (
    <>
      <div className="hidden space-y-8 md:block lg:hidden">
        {tabletRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "grid gap-8",
              row.length === 2 ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-2",
              row.length === 1 && "grid-cols-1 max-w-md mx-auto"
            )}
          >
            {row.map((testimonial) => (
              <TestimonialFullCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-8 md:hidden">
        {testimonials.map((testimonial) => (
          <TestimonialFullCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      <div className="hidden lg:block space-y-8">
        {desktopRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "grid gap-8",
              row.length === 3 && "grid-cols-3",
              row.length === 2 && "grid-cols-2 max-w-4xl mx-auto w-full",
              row.length === 1 && "grid-cols-1 max-w-md mx-auto"
            )}
          >
            {row.map((testimonial) => (
              <TestimonialFullCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function TestimonialsPageList({
  testimonials,
}: {
  testimonials: TestimonialPageItem[];
}) {
  if (testimonials.length === 0) return null;

  if (testimonials.length > CAROUSEL_THRESHOLD) {
    return <TestimonialsPageCarousel testimonials={testimonials} />;
  }

  return <TestimonialsBalancedGrid testimonials={testimonials} />;
}
