"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FavoriteEntityType } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Card } from "@/components/ui/card";
import {
  ListScrollHint,
  ScrollableItemList,
} from "@/components/ui/scalable-list";
import type { AppLocale } from "@/i18n/routing";
import type { FavoriteItem } from "@/lib/favorites-utils";
import { matchesArabicSearch } from "@/lib/search-utils";
import { formatDate } from "@/lib/utils";

const favoriteTypes: FavoriteEntityType[] = [
  "COURSE",
  "PODCAST",
  "BLOG_POST",
  "LESSON",
];

type FavoritesListProps = {
  favorites: FavoriteItem[];
};

export function FavoritesList({ favorites }: FavoritesListProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("dashboard.favorites");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("recent");

  const query = search.trim();
  const collator = locale === "fr" ? "fr" : "ar";

  const filteredFavorites = useMemo(() => {
    let items = favorites.filter((item) => {
      if (type !== "all" && item.entityType !== type) return false;
      if (!query) return true;
      const haystack =
        `${item.title} ${item.description ?? ""} ${item.meta ?? ""}`;
      return matchesArabicSearch(haystack, query);
    });

    const sorted = [...items];
    switch (sort) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, collator));
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [favorites, type, query, sort, collator]);

  const resultsLabel =
    filteredFavorites.length === 1
      ? t("resultsOne")
      : t("resultsMany", { count: filteredFavorites.length });

  return (
    <div className="space-y-6">
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchPlaceholder")}
        filters={[
          {
            id: "type",
            label: t("typeLabel"),
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: t("typeAll") },
              ...favoriteTypes.map((value) => ({
                value,
                label: t(`types.${value}`),
              })),
            ],
          },
          {
            id: "sort",
            label: t("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "recent", label: t("sortRecent") },
              { value: "oldest", label: t("sortOldest") },
              { value: "title", label: t("sortTitle") },
            ],
          },
        ]}
        resultsCount={filteredFavorites.length}
        resultsLabel={resultsLabel}
      />

      <ListScrollHint
        count={filteredFavorites.length}
        className="text-end sm:text-start"
      />

      {filteredFavorites.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">
            {favorites.length === 0 ? t("empty") : t("noResults")}
          </p>
        </Card>
      ) : (
        <ScrollableItemList
          count={filteredFavorites.length}
          stackGapClassName="space-y-3"
          maxHeightClassName="max-h-96 sm:max-h-[28rem]"
        >
          {filteredFavorites.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {t(`types.${item.entityType}`)}
                    </span>
                    {item.meta ? (
                      <span className="text-xs text-text/60">{item.meta}</span>
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-heading">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-text/70">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-text/50">
                    {t("savedOn", { date: formatDate(new Date(item.createdAt), locale) })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <FavoriteButton
                    entityType={item.entityType}
                    entityId={item.entityId}
                    initialFavorited
                    signedIn
                  />
                  <Link
                    href={item.href}
                    className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    {t("open")}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </ScrollableItemList>
      )}
    </div>
  );
}
