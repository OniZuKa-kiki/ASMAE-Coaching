"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { blogPageContent } from "@/lib/constants";
import { estimateReadTime } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { ContentFilterBar } from "@/components/content/content-filter-bar";

export type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string | null;
};

type BlogCatalogProps = {
  posts: BlogListItem[];
};

const filters = blogPageContent.filters;

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function BlogCatalog({ posts }: BlogCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category))].sort((a, b) => a.localeCompare(b, "ar")),
    [posts]
  );

  const query = normalizeSearch(search);

  const filteredPosts = useMemo(() => {
    let items = posts.filter((post) => {
      if (!query) return true;
      const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
      return haystack.includes(query);
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
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ar"));
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.publishedAt ?? 0).getTime() -
            new Date(a.publishedAt ?? 0).getTime()
        );
    }
  }, [posts, query, category, sort]);

  return (
    <>
      <ContentFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={filters.searchPlaceholder}
        searchLabel={filters.searchLabel}
        filters={[
          {
            id: "category",
            label: filters.categoryLabel,
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: filters.categoryAll },
              ...categories.map((value) => ({ value, label: value })),
            ],
          },
          {
            id: "sort",
            label: filters.sortLabel,
            value: sort,
            onChange: setSort,
            options: [
              { value: "newest", label: filters.sortNewest },
              { value: "oldest", label: filters.sortOldest },
              { value: "title", label: filters.sortTitle },
            ],
          },
        ]}
        resultsCount={filteredPosts.length}
        resultsLabel={filters.resultsCount(filteredPosts.length)}
      />

      {filteredPosts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{filters.noResults}</p>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
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
                    {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                  </span>
                  <span>{estimateReadTime(post.content)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
