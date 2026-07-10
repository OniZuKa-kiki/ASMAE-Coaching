import {
  DashboardCourseCatalog,
  type DashboardCourseItem,
} from "@/components/dashboard/dashboard-course-catalog";
import { getUserEnrollments } from "@/lib/dashboard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function countLessons(
  modules: { lessons: { id: string }[] }[]
): number {
  return modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export default async function DashboardCoursesPage() {
  const enrollments = await getUserEnrollments();

  const availableCourses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        include: { lessons: { select: { id: true } } },
      },
    },
    orderBy: { title: "asc" },
  });

  const enrolledIds = new Set(enrollments?.map((e) => e.courseId) ?? []);

  const enrolledItems: DashboardCourseItem[] =
    enrollments?.map((enrollment) => ({
      id: enrollment.courseId,
      slug: enrollment.course.slug,
      title: enrollment.course.title,
      description: enrollment.course.description,
      price: enrollment.course.price,
      moduleCount: enrollment.course.modules.length,
      lessonCount: enrollment.totalLessons,
      enrolled: true,
      enrollmentId: enrollment.id,
      progressAuto: enrollment.progressAuto,
      completedLessons: enrollment.completedLessons,
      lastLessonTitle: enrollment.lastLesson?.title ?? null,
      enrolledAt: enrollment.createdAt.toISOString(),
    })) ?? [];

  const availableItems: DashboardCourseItem[] = availableCourses
    .filter((course) => !enrolledIds.has(course.id))
    .map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      price: course.price,
      moduleCount: course.modules.length,
      lessonCount: countLessons(course.modules),
      enrolled: false,
    }));

  const courses = [...enrolledItems, ...availableItems];

  return (
    <div>
      <h1 className="page-header-title mb-4 sm:mb-6">دوراتي</h1>
      <DashboardCourseCatalog courses={courses} />
    </div>
  );
}
