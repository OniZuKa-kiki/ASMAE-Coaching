import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getUserEnrollments } from "@/lib/dashboard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardCoursesPage() {
  const enrollments = await getUserEnrollments();

  const availableCourses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { title: "asc" },
  });

  const enrolledIds = new Set(enrollments?.map((e) => e.courseId) || []);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        دوراتي
      </h1>

      {enrollments && enrollments.length > 0 ? (
        <div className="space-y-4 mb-10">
          <h2 className="font-body font-semibold text-heading">مشترياتي</h2>
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <h3 className="font-heading text-lg font-semibold text-heading mb-2">
                {enrollment.course.title}
              </h3>
              <p className="text-sm text-text/70 mb-3">
                {enrollment.course.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-primary font-medium mb-2">
                    التقدم: {enrollment.progressAuto}% ({enrollment.completedLessons}/
                    {enrollment.totalLessons} دروس مكتملة)
                  </p>
                  <p className="text-xs text-text/70">
                    يُحسب تلقائياً وفق الدروس المعلّمة كمكتملة في
                    تبويب الموارد.
                  </p>
                </div>
                <ButtonLink href={`/dashboard/resources?course=${enrollment.courseId}`} size="sm">
                  استعراض
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 mb-10">
          <p className="text-text/70 mb-6">
            لم تشترِ أي دورة تدريبية بعد.
          </p>
          <ButtonLink href="/courses">اكتشف الدورات التدريبية</ButtonLink>
        </Card>
      )}

      <h2 className="font-body font-semibold text-heading mb-4">
        الدورات المتاحة
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {availableCourses
          .filter((c) => !enrolledIds.has(c.id))
          .map((course) => (
            <Card key={course.id}>
              <h3 className="font-heading text-lg font-semibold text-heading mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-text/70 mb-4">{course.description}</p>
              <ButtonLink href={`/courses/${course.slug}`} size="sm">
                عرض البرنامج
              </ButtonLink>
            </Card>
          ))}
      </div>
    </div>
  );
}
