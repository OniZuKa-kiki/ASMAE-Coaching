import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { coursesPageContent } from "@/lib/constants";
import { getPublishedCourses } from "@/lib/content";
import { CourseCatalog } from "@/components/courses/course-catalog";

export const metadata: Metadata = {
  title: "دورات تدريبية عبر الإنترنت",
  description: coursesPageContent.subtitle,
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">{coursesPageContent.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {coursesPageContent.subtitle}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <CourseCatalog courses={courses} />
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow text-center">
          <SectionHeading
            title={coursesPageContent.ctaTitle}
            subtitle={coursesPageContent.ctaSubtitle}
          />
          <ButtonLink href="/booking" size="lg">
            {coursesPageContent.ctaButton}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
