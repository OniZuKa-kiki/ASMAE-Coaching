import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
  renderBlogContent,
} from "@/lib/content";
import { estimateReadTime } from "@/lib/content-i18n";
import type { AppLocale } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { localeAlternates } from "@/lib/seo";

/** ISR — 1 h (aligné sur src/lib/public-cache.ts) */
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [post, t] = await Promise.all([
    getBlogPostBySlug(slug),
    getTranslations("blog"),
  ]);
  if (!post) return { title: t("notFound") };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: localeAlternates(`/blog/${slug}`),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, locale, t, tCommon] = await Promise.all([
    getBlogPostBySlug(slug),
    getLocale() as Promise<AppLocale>,
    getTranslations("blog"),
    getTranslations("common"),
  ]);
  if (!post) notFound();

  return (
    <article className="section-padding">
      <div className="container-narrow max-w-3xl">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {post.category}
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-heading mt-6 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-text/60 mb-10 pb-10 border-b border-border/50">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? formatDate(post.publishedAt, locale) : "—"}
          </span>
          <span>{estimateReadTime(post.content, locale)}</span>
        </div>

        <div
          className="prose prose-lg max-w-none text-text"
          dangerouslySetInnerHTML={{ __html: renderBlogContent(post.content) }}
        />

        <div className="mt-12 p-8 rounded-[20px] bg-primary/5 border border-primary/10 text-center">
          <h3 className="font-heading text-2xl font-semibold text-heading mb-3">
            {t("ctaTitle")}
          </h3>
          <p className="text-text mb-6">{t("ctaSubtitle")}</p>
          <ButtonLink href="/booking">{tCommon("bookSession")}</ButtonLink>
        </div>
      </div>
    </article>
  );
}
