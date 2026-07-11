import type { LegalDocumentContent } from "@/lib/legal-content";



type LegalDocumentProps = {

  content: LegalDocumentContent;

  lastUpdatedLabel: string;

};



export function LegalDocument({ content, lastUpdatedLabel }: LegalDocumentProps) {

  return (

    <section className="section-padding">

      <div className="container-narrow max-w-3xl">

        <h1 className="page-header-title mb-4">{content.title}</h1>

        {content.intro ? (

          <p className="mb-10 text-lg text-text/80 leading-relaxed">{content.intro}</p>

        ) : null}

        <div className="space-y-10">

          {content.sections.map((section) => (

            <article key={section.title}>

              <h2 className="mb-4 font-heading text-2xl font-semibold text-heading">

                {section.title}

              </h2>

              {section.paragraphs.map((paragraph) => (

                <p key={paragraph} className="mb-3 text-text leading-relaxed">

                  {paragraph}

                </p>

              ))}

              {section.list ? (

                <ul className="list-disc space-y-2 ps-6 text-text leading-relaxed">

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

      </div>

    </section>

  );

}

