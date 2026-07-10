import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  getBlogPostBySlug,
  getPublishedBlogPosts,
  estimateReadTime,
  renderBlogContent,
} from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

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
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "المقال غير موجود" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="section-padding">
      <div className="container-narrow max-w-3xl">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {post.category}
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-semibold text-heading mt-6 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-text/60 mb-10 pb-10 border-b border-border/50">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.publishedAt ? formatDate(post.publishedAt) : "—"}
          </span>
          <span>{estimateReadTime(post.content)}</span>
        </div>

        <div
          className="prose prose-lg max-w-none text-text"
          dangerouslySetInnerHTML={{ __html: renderBlogContent(post.content) }}
        />

        <div className="mt-12 p-8 rounded-[20px] bg-primary/5 border border-primary/10 text-center">
          <h3 className="font-heading text-2xl font-semibold text-heading mb-3">
            هل تحتاجين إلى مرافقة شخصية؟
          </h3>
          <p className="text-text mb-6">
            احجزي جلسة لتعميق هذا الموضوع معًا.
          </p>
          <ButtonLink href="/booking">احجزي جلسة</ButtonLink>
        </div>
      </div>
    </article>
  );
}
