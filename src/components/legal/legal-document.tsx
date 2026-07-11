import { ContentSection } from "@/components/layout/content-section";
import { PageHero } from "@/components/layout/page-hero";
import type { LegalDocumentContent } from "@/lib/legal-content";

type LegalDocumentProps = {
  content: LegalDocumentContent;
  lastUpdatedLabel: string;
};

export function LegalDocument({ content, lastUpdatedLabel }: LegalDocumentProps) {
  return (
    <>
      <PageHero title={content.title} subtitle={content.intro} />

      <ContentSection tightTop narrow>
        <div className="prose-content space-y-10">
          {content.sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        {content.lastUpdated ? (
          <p className="mt-12 text-sm text-text/60">
            {lastUpdatedLabel}: {content.lastUpdated}
          </p>
        ) : null}
      </ContentSection>
    </>
  );
}
