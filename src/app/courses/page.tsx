import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/content";
import { CourseCatalog } from "@/components/courses/course-catalog";
import { ContentRecommendations } from "@/components/dashboard/content-recommendations";
import { getFavoriteKeysForCurrentUser } from "@/lib/favorites";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/courses"),
  };
}

export default async function CoursesPage() {
  const [courses, favoriteKeys, { userId }, t] = await Promise.all([
    getPublishedCourses(),
    getFavoriteKeysForCurrentUser(),
    auth(),
    getTranslations("courses"),
  ]);

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          {userId ? (
            <ContentRecommendations
              type="course"
              limit={2}
              showCatalogLinks={false}
              source="COURSES"
              className="mb-10"
            />
          ) : null}
          <CourseCatalog
            courses={courses}
            favoriteKeys={[...favoriteKeys]}
            signedIn={!!userId}
          />
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow text-center">
          <SectionHeading
            title={t("ctaTitle")}
            subtitle={t("ctaSubtitle")}
          />
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
