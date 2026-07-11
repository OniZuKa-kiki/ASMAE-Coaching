"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";

const stepKeys = ["listening", "plan", "support", "independence"] as const;
const stepNumbers = ["01", "02", "03", "04"] as const;

export function Method() {
  const t = useTranslations("home.method");

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stepKeys.map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <span className="font-heading text-4xl sm:text-5xl font-semibold text-accent/30">
                {stepNumbers[index]}
              </span>
              <h3 className="font-heading text-xl font-semibold text-heading mt-2 mb-3">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="text-text">{t(`steps.${key}.description`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
