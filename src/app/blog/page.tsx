import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { getPublishedBlogPosts } from "@/lib/content";
import { BlogCatalog } from "@/components/blog/blog-catalog";
import { getFavoriteKeysForCurrentUser } from "@/lib/favorites";

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
    publishedAt: post.publishedAt?.toISOString() ?? null,
  }));

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
          {posts.length === 0 ? (
            <p className="text-center text-text/70">{t("emptyMessage")}</p>
          ) : (
            <BlogCatalog
              posts={items}
              favoriteKeys={[...favoriteKeys]}
              signedIn={!!userId}
            />
          )}
        </div>
      </section>
    </>
  );
}
