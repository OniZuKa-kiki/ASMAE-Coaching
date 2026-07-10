"use server";

import { revalidatePath } from "next/cache";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export async function toggleLessonCompletion(
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  if (!lessonId || !action) return incomplete("ar");

  return runAction("ar", async () => {
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new Error("الدرس غير موجود");

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
        : Math.max(
            0,
            Math.min(100, Math.round((completedLessons / totalLessons) * 100))
          );

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
  }, "completed");
}
