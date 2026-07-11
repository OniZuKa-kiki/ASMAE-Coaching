"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type FaqItem = { question: string; answer: string };

export function FAQ() {
  const t = useTranslations("home.faq");
  const items = t.raw("items") as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <SectionHeading title={t("title")} />
        <div className="space-y-4">
          {items.map((faq, index) => (
            <div
              key={faq.question}
              className="rounded-[20px] border border-border/50 bg-card overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-6 text-start"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="min-w-0 flex-1 font-body text-sm sm:text-base font-semibold text-heading">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 shrink-0 text-primary transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-6 pb-6 text-text">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
