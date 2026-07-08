import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/user";

export async function getDashboardData() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const now = new Date();

  const [upcomingBookings, pastBookings, enrollments, payments, goalsCount] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          userId: user.id,
          status: "CONFIRMED",
          date: { gte: now },
        },
        include: { service: true },
        orderBy: { date: "asc" },
        take: 5,
      }),
      prisma.booking.count({
        where: {
          userId: user.id,
          status: { in: ["CONFIRMED", "COMPLETED"] },
          date: { lt: now },
        },
      }),
      prisma.courseEnrollment.count({ where: { userId: user.id } }),
      prisma.payment.count({
        where: { userId: user.id, status: "PAID" },
      }),
      prisma.goal.count({
        where: { userId: user.id, isCompleted: false },
      }),
    ]);

  return {
    user,
    stats: {
      upcoming: upcomingBookings.length,
      enrollments,
      goals: goalsCount,
      payments,
    },
    upcomingBookings,
    pastBookingsCount: pastBookings,
  };
}

export async function getUserBookings() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        date: { gte: now },
      },
      include: { service: true },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        date: { lt: now },
      },
      include: { service: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return { upcoming, past };
}

export async function getUserPayments() {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.payment.findMany({
    where: { userId: user.id },
    include: {
      booking: { include: { service: true } },
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserEnrollments() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courseIds = enrollments.map((e) => e.courseId);
  const completions = await prisma.lessonCompletion.findMany({
    where: {
      userId: user.id,
      lesson: { module: { courseId: { in: courseIds } } },
    },
    include: {
      lesson: {
        select: {
          module: { select: { courseId: true } },
        },
      },
    },
  });

  const completedByCourse = new Map<string, number>();
  for (const completion of completions) {
    const cid = completion.lesson.module.courseId;
    completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
  }

  return enrollments.map((enrollment) => {
    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );
    const completedLessons = completedByCourse.get(enrollment.courseId) ?? 0;
    const progressAuto =
      totalLessons === 0
        ? 0
        : Math.max(0, Math.min(100, Math.round((completedLessons / totalLessons) * 100)));

    return {
      ...enrollment,
      progressAuto,
      completedLessons,
      totalLessons,
    };
  });
}

export async function getUserGoals() {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ isCompleted: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getUserJournalEntries() {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getDashboardResources() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                where: {
                  OR: [{ videoUrl: { not: null } }, { pdfUrl: { not: null } }],
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonIds = enrollments.flatMap((enrollment) =>
    enrollment.course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
  );

  const completions = await prisma.lessonCompletion.findMany({
    where: {
      userId: user.id,
      lessonId: { in: lessonIds },
    },
    select: { lessonId: true },
  });
  const completedSet = new Set(completions.map((c) => c.lessonId));

  return enrollments.flatMap((enrollment) =>
    enrollment.course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        id: lesson.id,
        courseId: enrollment.course.id,
        courseSlug: enrollment.course.slug,
        courseTitle: enrollment.course.title,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        videoUrl: lesson.videoUrl,
        pdfUrl: lesson.pdfUrl,
        completed: completedSet.has(lesson.id),
      }))
    )
  );
}

export async function getDashboardPodcasts() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const hasPaidBooking = await prisma.booking.count({
    where: {
      userId: user.id,
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
  });

  const hasPaidCourse = await prisma.payment.count({
    where: {
      userId: user.id,
      status: "PAID",
      courseId: { not: null },
    },
  });

  const premiumUnlocked = hasPaidBooking > 0 || hasPaidCourse > 0;

  const podcasts = await prisma.podcast.findMany({
    where: {
      isPublished: true,
      ...(premiumUnlocked ? {} : { isPremium: false }),
    },
    orderBy: { createdAt: "desc" },
  });

  return { podcasts, premiumUnlocked };
}
