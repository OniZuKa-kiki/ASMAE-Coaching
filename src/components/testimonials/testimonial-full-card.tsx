import { Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { TestimonialCarouselItem } from "@/components/home/testimonials-carousel";

export type TestimonialPageItem = TestimonialCarouselItem & {
  role: string | null;
};

export function TestimonialFullCard({
  testimonial,
}: {
  testimonial: TestimonialPageItem;
}) {
  return (
    <Card className="relative h-full">
      <Quote className="absolute end-6 top-6 h-8 w-8 text-accent/30" />
      <div className="mb-4 flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="mb-6 text-text italic leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <span className="font-heading font-semibold text-primary">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-semibold text-heading">{testimonial.name}</p>
          {testimonial.role ? (
            <p className="text-sm text-text/70">{testimonial.role}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
