import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { LibraryCatalog } from "@/components/dashboard/library-catalog";
import { getDashboardResources } from "@/lib/dashboard";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getUserFavoriteKeysSet } from "@/lib/favorites";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/resources",
    namespace: "dashboard.library",
    titleKey: "metaTitle",
    descriptionKey: "metaDescription",
  });
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function DashboardResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedCourseId = getQueryValue(params.course).trim();
  const [user, t] = await Promise.all([
    getOrCreateUser(),
    getTranslations("dashboard.library"),
  ]);
  const [resources, favoriteKeys] = await Promise.all([
    getDashboardResources(),
    user ? getUserFavoriteKeysSet(user.id) : Promise.resolve(new Set<string>()),
  ]);
  const filteredResources =
    !resources || !selectedCourseId
      ? resources ?? []
      : resources.filter((resource) => resource.courseId === selectedCourseId);

  const selectedCourseTitle =
    selectedCourseId && filteredResources.length > 0
      ? filteredResources[0].courseTitle
      : null;

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("pageTitle")}</h1>
      {!resources || resources.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{t("emptyLibrary")}</p>
        </Card>
      ) : (
        <LibraryCatalog
          resources={filteredResources}
          selectedCourseId={selectedCourseId || undefined}
          selectedCourseTitle={selectedCourseTitle}
          favoriteKeys={[...favoriteKeys]}
        />
      )}
    </div>
  );
}
