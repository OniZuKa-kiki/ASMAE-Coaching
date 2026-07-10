import type { Metadata } from "next";
import { Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { aboutContent, aboutPageContent } from "@/lib/constants";

export const metadata: Metadata = {
  title: "من أنا",
  description:
    "تعرفي على قصتي، ورسالتي، والقيم التي ألتزم بها في مرافقتكِ.",
};

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph} className="text-text leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
            {aboutPageContent.eyebrow}
          </p>
          <h1 className="page-title mb-6">{aboutPageContent.title}</h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            {aboutPageContent.subtitle}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-heading mb-6">
                {aboutPageContent.storyTitle}
              </h2>
              <Paragraphs text={aboutContent.story} />
            </div>
            <div className="aspect-video rounded-[20px] bg-primary/10 flex items-center justify-center border border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <p className="text-text/70 text-sm">{aboutPageContent.videoLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <h2 className="font-heading text-3xl font-semibold text-heading mb-6 text-center">
            {aboutPageContent.whyTitle}
          </h2>
          <div className="text-text leading-relaxed max-w-3xl mx-auto text-lg text-center">
            <Paragraphs text={aboutContent.why} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading text-3xl font-semibold text-heading mb-6">
            {aboutPageContent.missionTitle}
          </h2>
          <p className="text-text leading-relaxed max-w-3xl mx-auto text-lg">
            {aboutContent.mission}
          </p>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <SectionHeading title={aboutPageContent.valuesTitle} />
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
            {aboutPageContent.ctaTitle}
          </h2>
          <p className="text-text mb-8">{aboutPageContent.ctaSubtitle}</p>
          <ButtonLink href="/booking" size="lg">
            {aboutPageContent.ctaButton}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
