import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Video, FileText, Award } from "lucide-react";
import { PurchaseCourseButton } from "@/components/courses/purchase-button";
import { courses } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) return { title: "الدورة غير موجودة" };
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
              دورة تدريبية
            </p>
            <h1 className="font-heading text-4xl font-semibold text-heading mb-6">
              {course.title}
            </h1>
            <p className="text-lg text-text/80 mb-8">{course.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <BookOpen className="w-5 h-5 text-primary mb-2" />
                <p className="font-semibold text-heading">{course.modules}</p>
                <p className="text-sm text-text/70">وحدات</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <Video className="w-5 h-5 text-primary mb-2" />
                <p className="font-semibold text-heading">{course.lessons}</p>
                <p className="text-sm text-text/70">دروس</p>
              </div>
            </div>

            <h2 className="font-heading text-xl font-semibold text-heading mb-4">
              ما الذي ستحصل عليه
            </h2>
            <ul className="space-y-2 mb-8">
              {course.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-text">
                  <FileText className="w-4 h-4 text-primary" />
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-2 text-text">
                <Award className="w-4 h-4 text-primary" />
                وصول مدى الحياة
              </li>
            </ul>
          </div>

          <div>
            <div className="lg:sticky lg:top-28 rounded-[20px] bg-card border border-border/50 p-4 sm:p-6 lg:p-8 shadow-soft">
              <div className="aspect-video rounded-xl bg-primary/10 mb-6 flex items-center justify-center">
                <Video className="w-16 h-16 text-primary/40" />
              </div>
              <p className="font-heading text-3xl font-semibold text-primary mb-2">
                {formatPrice(course.price)}
              </p>
              <p className="text-sm text-text/70 mb-6">دفعة واحدة — وصول فوري</p>
              <PurchaseCourseButton slug={course.slug} price={course.price} />
              <p className="text-xs text-text/50 text-center">
                دفع آمن عبر Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
