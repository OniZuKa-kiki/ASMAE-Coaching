"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { estimateReadTime } from "@/lib/content-i18n";
import { formatDate } from "@/lib/utils";
import { ContentFilterBar } from "@/components/content/content-filter-bar";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { isFavorited } from "@/lib/favorites-utils";
import { matchesArabicSearch } from "@/lib/search-utils";
import type { AppLocale } from "@/i18n/routing";

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string | null;
};

type BlogCatalogProps = {
  posts: BlogListItem[];
  favoriteKeys?: string[];
  signedIn?: boolean;
};

export function BlogCatalog({
  posts,
  favoriteKeys = [],
  signedIn = false,
}: BlogCatalogProps) {
  const locale = useLocale() as AppLocale;
  const tFilters = useTranslations("blog.filters");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const collator = locale === "fr" ? "fr" : "ar";

  const categories = useMemo(
    () =>
      [...new Set(posts.map((post) => post.category))].sort((a, b) =>
        a.localeCompare(b, collator)
      ),
    [posts, collator]
  );

  const query = search.trim();

  const filteredPosts = useMemo(() => {
    let items = posts.filter((post) => {
      if (!query) return true;
      const haystack = `${post.title} ${post.excerpt} ${post.category}`;
      return matchesArabicSearch(haystack, query);
    });

    if (category !== "all") {
      items = items.filter((post) => post.category === category);
    }

    const sorted = [...items];
    switch (sort) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.publishedAt ?? 0).getTime() -
            new Date(b.publishedAt ?? 0).getTime()
        );
      case "title":
        return sorted.sort((a, b) =>
          a.title.localeCompare(b.title, collator)
        );
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.publishedAt ?? 0).getTime() -
            new Date(a.publishedAt ?? 0).getTime()
        );
    }
  }, [posts, query, category, sort, collator]);

  const resultsLabel =
    filteredPosts.length === 1
      ? tFilters("resultsOne")
      : tFilters("resultsMany", { count: filteredPosts.length });

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={tFilters("searchPlaceholder")}
        searchLabel={tFilters("searchLabel")}
        filters={[
          {
            id: "category",
            label: tFilters("categoryLabel"),
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: tFilters("categoryAll") },
              ...categories.map((value) => ({ value, label: value })),
            ],
          },
          {
            id: "sort",
            label: tFilters("sortLabel"),
            value: sort,
            onChange: setSort,
            options: [
              { value: "newest", label: tFilters("sortNewest") },
              { value: "oldest", label: tFilters("sortOldest") },
              { value: "title", label: tFilters("sortTitle") },
            ],
          },
        ]}
        resultsCount={filteredPosts.length}
        resultsLabel={resultsLabel}
      />

      {filteredPosts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{tFilters("noResults")}</p>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <div key={post.slug} className="relative">
              <FavoriteButton
                entityType="BLOG_POST"
                entityId={post.id}
                initialFavorited={isFavorited(favoriteKeys, "BLOG_POST", post.id)}
                signedIn={signedIn}
                className="absolute top-3 left-3 z-10"
              />
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {post.category}
                  </span>
                  <h2 className="mb-3 mt-4 font-heading text-2xl font-semibold text-heading">
                    {post.title}
                  </h2>
                  <p className="mb-4 text-text">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-text/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.publishedAt ? formatDate(post.publishedAt, locale) : "—"}
                    </span>
                    <span>{estimateReadTime(post.content, locale)}</span>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
