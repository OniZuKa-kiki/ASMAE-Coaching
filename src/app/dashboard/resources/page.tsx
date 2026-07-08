import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { getDashboardResources } from "@/lib/dashboard";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

async function toggleLessonCompletion(formData: FormData) {
  "use server";
  const user = await requireUser();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  if (!lessonId || !action) return;

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) return;

  if (action === "complete") {
    await prisma.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: {},
      create: { userId: user.id, lessonId },
    });
  } else if (action === "undo") {
    await prisma.lessonCompletion.deleteMany({
      where: { userId: user.id, lessonId },
    });
  }

  const courseId = lesson.module.courseId;
  const totalLessons = await prisma.courseLesson.count({
    where: { module: { courseId } },
  });
  const completedLessons = await prisma.lessonCompletion.count({
    where: {
      userId: user.id,
      lesson: { module: { courseId } },
    },
  });
  const progress =
    totalLessons === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((completedLessons / totalLessons) * 100)));

  await prisma.courseEnrollment.updateMany({
    where: { userId: user.id, courseId },
    data: {
      progress,
      completedAt: progress >= 100 ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/resources");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard");
}

export default async function DashboardResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedCourseId = getQueryValue(params.course).trim();
  const resources = await getDashboardResources();
  const filteredResources =
    !resources || !selectedCourseId
      ? resources
      : resources.filter((r) => r.courseId === selectedCourseId);

  const selectedCourseTitle =
    selectedCourseId && filteredResources && filteredResources.length > 0
      ? filteredResources[0].courseTitle
      : null;

  const totalCount = filteredResources?.length ?? 0;
  const completedCount = filteredResources
    ? filteredResources.filter((r) => r.completed).length
    : 0;

  const grouped =
    filteredResources?.reduce(
      (acc, r) => {
        const courseKey = r.courseId;
        acc[courseKey] ??= {
          courseId: r.courseId,
          courseTitle: r.courseTitle,
          modules: {},
        };
        acc[courseKey].modules[r.moduleTitle] ??= [];
        acc[courseKey].modules[r.moduleTitle].push(r);
        return acc;
      },
      {} as Record<
        string,
        {
          courseId: string;
          courseTitle: string;
          modules: Record<string, typeof filteredResources>;
        }
      >
    ) ?? {};

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        الموارد
      </h1>
      {selectedCourseId ? (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-text/60">دورة تدريبية</p>
              <p className="font-semibold text-heading">
                {selectedCourseTitle ?? "دورة تدريبية"}
              </p>
              <p className="text-sm text-text/70 mt-1">
                {totalCount === 0
                  ? "لا توجد موارد لهذه الدورة."
                  : `${completedCount}/${totalCount} دروس مكتملة`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard/courses"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
              >
                دوراتي
              </Link>
              <Link
                href="/dashboard/resources"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                عرض الكل
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-text/70 mb-6">
          هنا تجد فيديوهات ومستندات جميع دوراتك.
        </p>
      )}
      {!filteredResources || filteredResources.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">
            ستظهر موارد دوراتك هنا.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map((course) => (
            <div key={course.courseId} className="space-y-3">
              {!selectedCourseId && (
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold text-heading">
                    {course.courseTitle}
                  </h2>
                  <Link
                    href={`/dashboard/resources?course=${course.courseId}`}
                    className="text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    فتح
                  </Link>
                </div>
              )}

              {Object.entries(course.modules).map(([moduleTitle, lessons]) => (
                <Card key={moduleTitle}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-text/60">وحدة</p>
                      <p className="font-semibold text-heading">{moduleTitle}</p>
                    </div>
                    <p className="text-xs text-text/60">
                      {lessons.filter((l) => l.completed).length}/{lessons.length} مكتملة
                    </p>
                  </div>

                  <div className="space-y-3">
                    {lessons.map((resource) => (
                      <div
                        key={resource.id}
                        className="rounded-xl border border-border/60 bg-background/40 p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-heading">
                              {resource.lessonTitle}
                            </p>
                            {resource.completed && (
                              <p className="text-xs text-primary font-semibold mt-1">
                                درس مكتمل
                              </p>
                            )}
                          </div>
                          <form action={toggleLessonCompletion}>
                            <input type="hidden" name="lessonId" value={resource.id} />
                            <input
                              type="hidden"
                              name="action"
                              value={resource.completed ? "undo" : "complete"}
                            />
                            <button
                              type="submit"
                              className={
                                resource.completed
                                  ? "rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                  : "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
                              }
                            >
                              {resource.completed ? "إلغاء الإكمال" : "تعليم كمكتمل"}
                            </button>
                          </form>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                          {resource.videoUrl && (
                            <a
                              href={resource.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-primary hover:text-primary-hover"
                            >
                              مشاهدة الفيديو
                            </a>
                          )}
                          {resource.pdfUrl && (
                            <a
                              href={resource.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-primary hover:text-primary-hover"
                            >
                              فتح ملف PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
