import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getUserFavorites } from "@/lib/favorites";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/favorites",
    namespace: "dashboard.favorites",
    titleKey: "title",
    descriptionKey: "subtitle",
  });
}

export default async function DashboardFavoritesPage() {
  const [user, t, tCommon] = await Promise.all([
    getOrCreateUser(),
    getTranslations("dashboard.favorites"),
    getTranslations("common"),
  ]);

  if (!user) {
    return <p>{tCommon("loading")}</p>;
  }

  const favorites = await getUserFavorites(user.id);

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("title")}</h1>
      <p className="mb-6 text-text/70">{t("subtitle")}</p>

      {favorites.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="mb-6 text-text/70">{t("empty")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/courses">{t("browseCourses")}</ButtonLink>
            <ButtonLink href="/podcasts" variant="secondary">
              {t("browsePodcasts")}
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <FavoritesList favorites={favorites} />
      )}
    </div>
  );
}
