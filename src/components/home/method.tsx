"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { methodSteps, methodSection } from "@/lib/constants";

export function Method() {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <SectionHeading
          title={methodSection.title}
          subtitle={methodSection.subtitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methodSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <span className="font-heading text-5xl font-semibold text-accent/30">
                {step.step}
              </span>
              <h3 className="font-heading text-xl font-semibold text-heading mt-2 mb-3">
                {step.title}
              </h3>
              <p className="text-text">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
