"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { heroContent } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden section-padding">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="container-narrow relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-accent font-body font-medium text-sm tracking-[0.2em] uppercase mb-6">
            {heroContent.eyebrow}
          </p>
          <h1 className="font-heading text-5xl md:text-6xl font-semibold text-heading leading-tight mb-6">
            {heroContent.title}
          </h1>
          <p className="font-body text-xl text-text/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {heroContent.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href={heroContent.ctaPrimary.href} size="lg">
              {heroContent.ctaPrimary.label}
            </ButtonLink>
            <ButtonLink
              href={heroContent.ctaSecondary.href}
              variant="secondary"
              size="lg"
            >
              {heroContent.ctaSecondary.label}
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
