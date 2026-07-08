"use client";

import { motion } from "framer-motion";
import { Heart, Brain, Users, Briefcase } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { problems } from "@/lib/constants";

const iconMap = {
  heart: Heart,
  brain: Brain,
  users: Users,
  briefcase: Briefcase,
};

export function Problems() {
  return (
    <section className="section-padding bg-card/50">
      <div className="container-narrow">
        <SectionHeading
          title="هل تتعرّفين على نفسك؟"
          subtitle="أرافقك في التغلب على هذه التحديات اليومية"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => {
            const Icon = iconMap[problem.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-heading mb-2">
                        {problem.title}
                      </h3>
                      <p className="text-text">{problem.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
