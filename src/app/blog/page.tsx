import type { Metadata } from "next";
import { blogPageContent } from "@/lib/constants";
import { getPublishedBlogPosts } from "@/lib/content";
import { BlogCatalog } from "@/components/blog/blog-catalog";

export const metadata: Metadata = {
  title: blogPageContent.title,
  description: blogPageContent.subtitle,
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const items = posts.map((post) => ({
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
          <h1 className="page-title mb-6">{blogPageContent.title}</h1>
          <p className="mx-auto max-w-2xl text-xl text-text/80">
            {blogPageContent.subtitle}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          {posts.length === 0 ? (
            <p className="text-center text-text/70">
              {blogPageContent.emptyMessage}
            </p>
          ) : (
            <BlogCatalog posts={items} />
          )}
        </div>
      </section>
    </>
  );
}
