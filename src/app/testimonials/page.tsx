import type { Metadata } from "next";

import { Star, Quote } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";

import { Card } from "@/components/ui/card";

import { ButtonLink } from "@/components/ui/button";

import { getVisibleTestimonials } from "@/lib/content";



export const metadata: Metadata = {

  title: "الشهادات",

  description:

    "اكتشف شهادات العملاء الذين رافقتهم في التدريب على الحياة.",

};



export default async function TestimonialsPage() {

  const testimonials = await getVisibleTestimonials();



  return (

    <>

      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">

        <div className="container-narrow text-center">

          <h1 className="page-title mb-6">

            الشهادات

          </h1>

          <p className="text-xl text-text/80 max-w-2xl mx-auto">

            الثقة في صميم التدريب. إليك ما يقوله من شرفني بمرافقتهم.

          </p>

        </div>

      </section>



      <section className="section-padding">

        <div className="container-narrow">

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {testimonials.map((testimonial) => (

              <Card key={testimonial.id} className="relative">

                <Quote className="w-8 h-8 text-accent/30 absolute top-6 end-6" />

                <div className="flex gap-1 mb-4">

                  {Array.from({ length: testimonial.rating }).map((_, i) => (

                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />

                  ))}

                </div>

                <p className="text-text italic mb-6 leading-relaxed">

                  &ldquo;{testimonial.content}&rdquo;

                </p>

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">

                    <span className="font-heading text-primary font-semibold">

                      {testimonial.name.charAt(0)}

                    </span>

                  </div>

                  <div>

                    <p className="font-semibold text-heading">{testimonial.name}</p>

                    <p className="text-sm text-text/70">{testimonial.role}</p>

                  </div>

                </div>

              </Card>

            ))}

          </div>

        </div>

      </section>



      <section className="section-padding bg-card/50">

        <div className="container-narrow text-center">

          <SectionHeading

            title="وماذا لو كان دورك؟"

            subtitle="انضم إلى من غيّروا حياتهم"

          />

          <ButtonLink href="/booking" size="lg">

            حجز جلسة

          </ButtonLink>

        </div>

      </section>

    </>

  );

}

