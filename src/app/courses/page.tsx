import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
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
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
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
      </ContentSection>

      <ContentSection variant="band">
        <div className="text-center">
          <SectionHeading title={t("ctaTitle")} subtitle={t("ctaSubtitle")} />
          <ButtonLink href="/booking" size="lg">
            {t("ctaButton")}
          </ButtonLink>
        </div>
      </ContentSection>
    </>
  );
}
