import type { Metadata } from "next";
import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

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
    <div className="prose-content">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
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
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <ContentSection>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="section-title mb-6">{t("storyTitle")}</h2>
            <Paragraphs text={t("story")} />
          </div>
          <div className="flex aspect-video items-center justify-center rounded-card border border-border/50 bg-primary/10">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Play className="ms-1 h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-text/70">{t("videoLabel")}</p>
            </div>
          </div>
        </div>
      </ContentSection>

      <ContentSection variant="band">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title mb-6">{t("whyTitle")}</h2>
          <div className="section-lead">
            <Paragraphs text={t("why")} />
          </div>
        </div>
      </ContentSection>

      <ContentSection>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="section-title mb-6">{t("missionTitle")}</h2>
          <p className="section-lead">{t("mission")}</p>
        </div>
      </ContentSection>

      <ContentSection variant="band">
        <SectionHeading title={t("valuesTitle")} />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {valueKeys.map((key) => (
            <Card key={key} className="text-center">
              <CardTitle className="mb-3 text-xl">
                {t(`values.${key}.title`)}
              </CardTitle>
              <p className="text-sm text-text">
                {t(`values.${key}.description`)}
              </p>
            </Card>
          ))}
        </div>
      </ContentSection>

      <ContentSection>
        <div className="text-center">
          <h2 className="section-title mb-4">{t("ctaTitle")}</h2>
          <p className="mb-8 text-text/80">{t("ctaSubtitle")}</p>
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </ContentSection>
    </>
  );
}
