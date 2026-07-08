"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";

export function TestimonialsPreview({
  testimonials,
}: {
  testimonials: {
    name: string;
    role: string | null;
    content: string;
    rating: number;
  }[];
}) {
  return (
    <section className="section-padding bg-card/50">
      <div className="container-narrow">
        <SectionHeading
          title="ماذا يقولون"
          subtitle="ثقة من رافقتهم في رحلتهم"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="text-text italic flex-1 mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-heading">{testimonial.name}</p>
                  <p className="text-sm text-text/70">{testimonial.role ?? ""}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
