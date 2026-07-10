import { ButtonLink } from "@/components/ui/button";
import { finalCtaSection } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container-narrow text-center">
        <h2 className="font-heading text-4xl font-semibold text-heading mb-4">
          {finalCtaSection.title}
        </h2>
        <p className="font-body text-xl text-text/80 mb-8 max-w-xl mx-auto">
          {finalCtaSection.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonLink href="/booking" size="lg">
            {finalCtaSection.primaryLabel}
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            {finalCtaSection.secondaryLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
