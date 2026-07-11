import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { getPublishedBlogPosts } from "@/lib/content";
import { BlogCatalog } from "@/components/blog/blog-catalog";
import { getFavoriteKeysForCurrentUser } from "@/lib/favorites";
import { toIsoString } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/blog"),
  };
}

export default async function BlogPage() {
  const [posts, favoriteKeys, { userId }, t] = await Promise.all([
    getPublishedBlogPosts(),
    getFavoriteKeysForCurrentUser(),
    auth(),
    getTranslations("blog"),
  ]);
  const items = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    publishedAt: toIsoString(post.publishedAt),
  }));

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
        {posts.length === 0 ? (
          <p className="text-center text-text/70">{t("emptyMessage")}</p>
        ) : (
          <BlogCatalog
            posts={items}
            favoriteKeys={[...favoriteKeys]}
            signedIn={!!userId}
          />
        )}
      </ContentSection>
    </>
  );
}
