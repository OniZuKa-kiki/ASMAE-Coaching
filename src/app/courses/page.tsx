import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Video, FileText } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/content";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "الدورات التدريبية",
  description:
    "دورات تدريبية عبر الإنترنت لتطوير ثقتك بنفسك، وإدارة التوتر، وتحقيق أهدافك.",
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();
  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">
            دورات تدريبية عبر الإنترنت
          </h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            برامج متكاملة للتقدم وفق إيقاعك، مع فيديوهات وتمارين وموارد
            قابلة للتحميل.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.slug} className="flex flex-col">
                <div className="aspect-video rounded-xl bg-primary/10 mb-6 flex items-center justify-center">
                  <Video className="w-12 h-12 text-primary/50" />
                </div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="flex-1">
                  {course.description}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-text/70 my-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.modules} وحدات
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {course.lessons} دروس
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.includes.map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="font-heading text-2xl font-semibold text-primary">
                    {formatPrice(course.price)}
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    عرض البرنامج ←
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-card/50">
        <div className="container-narrow text-center">
          <SectionHeading
            title="غير متأكد(ة) من الدورة المناسبة؟"
            subtitle="احجز مكالمة تعريفية مجانية لمناقشة ذلك معاً"
          />
          <ButtonLink href="/booking" size="lg">
            حجز مكالمة تعريفية
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
