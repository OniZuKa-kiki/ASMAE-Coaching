"use client";

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";

export function FinalCTA() {
  const t = useTranslations("home.finalCta");

  return (
    <section className="section-padding bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container-narrow text-center">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-heading mb-4">
          {t("title")}
        </h2>
        <p className="font-body text-base sm:text-lg lg:text-xl text-text/80 mb-8 max-w-xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonLink href="/booking" size="lg">
            {t("primary")}
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            {t("secondary")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
