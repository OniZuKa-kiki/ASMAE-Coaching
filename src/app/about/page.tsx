import type { Metadata } from "next";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PUBLIC_CONTENT_REVALIDATE_SECONDS } from "@/lib/public-cache";

export const revalidate = PUBLIC_CONTENT_REVALIDATE_SECONDS;
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/about"),
  };
}

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

const valueKeys = [
  "empathy",
  "authenticity",
  "confidentiality",
  "commitment",
] as const;

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
            {t("eyebrow")}
          </p>
          <h1 className="page-title mb-6">{t("title")}</h1>
          <p className="text-base sm:text-lg lg:text-xl text-text/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-heading mb-6">
                {t("storyTitle")}
              </h2>
              <Paragraphs text={t("story")} />
            </div>
            <div className="aspect-video rounded-[20px] bg-primary/10 flex items-center justify-center border border-border/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
                <p className="text-text/70 text-sm">{t("videoLabel")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-heading mb-6 text-center">
            {t("whyTitle")}
          </h2>
          <div className="text-text leading-relaxed max-w-3xl mx-auto text-base sm:text-lg text-center">
            <Paragraphs text={t("why")} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-heading mb-6">
            {t("missionTitle")}
          </h2>
          <p className="text-text leading-relaxed max-w-3xl mx-auto text-base sm:text-lg">
            {t("mission")}
          </p>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow">
          <SectionHeading title={t("valuesTitle")} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueKeys.map((key) => (
              <Card key={key} className="text-center">
                <CardTitle className="text-xl mb-3">
                  {t(`values.${key}.title`)}
                </CardTitle>
                <p className="text-text text-sm">
                  {t(`values.${key}.description`)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-heading mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-text mb-8">{t("ctaSubtitle")}</p>
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
