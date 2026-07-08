import type { Metadata } from "next";
import { Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { aboutContent } from "@/lib/constants";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "اكتشف قصتي ورسالتي والقيم التي توجهني في التدريب على الحياة.",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
            من نحن
          </p>
          <h1 className="page-title mb-6">
            مدربة، قصة، ورسالة
          </h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            العملاء يختارون الشخص. إليك من أنا، ولماذا أمارس هذا المهنة، وما
            الذي يوجهني كل يوم.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-heading mb-6">
                قصتي
              </h2>
              <p className="text-text leading-relaxed">{aboutContent.story}</p>
            </div>
            <div className="aspect-video rounded-[20px] bg-primary/10 flex items-center justify-center border border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <p className="text-text/70 text-sm">فيديو تعريفي</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <h2 className="font-heading text-3xl font-semibold text-heading mb-6 text-center">
            لماذا أصبحت مدربة
          </h2>
          <p className="text-text leading-relaxed max-w-3xl mx-auto text-center text-lg">
            {aboutContent.why}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading text-3xl font-semibold text-heading mb-6">
            رسالتي
          </h2>
          <p className="text-text leading-relaxed max-w-3xl mx-auto text-lg">
            {aboutContent.mission}
          </p>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <SectionHeading title="قيمي" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutContent.values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardTitle className="text-xl mb-3">{value.title}</CardTitle>
                <p className="text-text text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading text-3xl font-semibold text-heading mb-4">
            هل ترغب في معرفة المزيد؟
          </h2>
          <p className="text-text mb-8">
            احجز مكالمة تعريفية مجانية للتعارف.
          </p>
          <ButtonLink href="/booking" size="lg">
            حجز مكالمة تعريفية
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
