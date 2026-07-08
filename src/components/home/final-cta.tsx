import { ButtonLink } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container-narrow text-center">
        <h2 className="font-heading text-4xl font-semibold text-heading mb-4">
          هل أنت مستعد لتغيير حياتك؟
        </h2>
        <p className="font-body text-xl text-text/80 mb-8 max-w-xl mx-auto">
          احجز مكالمة تعارف مجانية مدتها 20 دقيقة ولنتعرّف على بعضنا.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonLink href="/booking" size="lg">
            احجز مكالمة تعارف
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            تواصل معي
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
