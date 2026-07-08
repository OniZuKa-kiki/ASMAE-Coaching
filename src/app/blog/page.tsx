import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getPublishedBlogPosts, estimateReadTime } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "المدونة",
  description:
    "مقالات حول التنمية الشخصية، الثقة بالنفس، التوتر، والعلاقات.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">
            المدونة
          </h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            نصائح وتأملات وأدوات للتقدم في رحلة التحول الشخصي.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          {posts.length === 0 ? (
            <p className="text-center text-text/70">
              لا توجد مقالات حالياً.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <h2 className="font-heading text-2xl font-semibold text-heading mt-4 mb-3">
                      {post.title}
                    </h2>
                    <p className="text-text mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-text/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt
                          ? formatDate(post.publishedAt)
                          : "—"}
                      </span>
                      <span>{estimateReadTime(post.content)}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
