"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type StatItem = { value: string; label: string };

export function Stats() {
  const t = useTranslations("home.stats");
  const items = t.raw("items") as StatItem[];

  return (
    <section className="section-padding bg-primary text-white">
      <div className="container-narrow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-2">
                {stat.value}
              </p>
              <p className="text-white/80 font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
