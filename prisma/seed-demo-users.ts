/**
 * Crée les comptes démo dans Clerk + synchronise Prisma + données de test.
 *
 * Prérequis : CLERK_SECRET_KEY et DATABASE_URL dans .env / .env.local
 * Usage : npm run db:seed-demo-users
 */
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";
import { demoUserAccounts } from "./demo-users";
import { loadProjectEnv } from "./load-env";
import { slotKeyForStatus } from "../src/lib/booking";

loadProjectEnv();

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable manquante : ${name}`);
  }
  return value;
}

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function verifyUserEmails(
  clerk: ReturnType<typeof createClerkClient>,
  userId: string
) {
  const user = await clerk.users.getUser(userId);
  for (const email of user.emailAddresses) {
    if (email.verification?.status !== "verified") {
      await clerk.emailAddresses.updateEmailAddress(email.id, {
        verified: true,
      });
    }
  }
}

async function upsertClerkUser(account: (typeof demoUserAccounts)[number]) {
  const clerk = createClerkClient({
    secretKey: requireEnv("CLERK_SECRET_KEY"),
  });

  const existing = await clerk.users.getUserList({
    emailAddress: [account.email],
    limit: 1,
  });

  let userId: string;

  if (existing.data.length > 0) {
    const user = existing.data[0];
    await clerk.users.updateUser(user.id, {
      password: account.password,
      firstName: account.firstName,
      lastName: account.lastName,
      publicMetadata: { role: account.clerkRole },
    });
    userId = user.id;
    console.log(`  ↻ Clerk mis à jour : ${account.email}`);
  } else {
    const user = await clerk.users.createUser({
      emailAddress: [account.email],
      password: account.password,
      firstName: account.firstName,
      lastName: account.lastName,
      publicMetadata: { role: account.clerkRole },
      skipPasswordChecks: true,
      skipLegalChecks: true,
    });
    userId = user.id;
    console.log(`  ✓ Clerk créé : ${account.email}`);
  }

  await verifyUserEmails(clerk, userId);
  return userId;
}

async function upsertDbUser(
  clerkId: string,
  account: (typeof demoUserAccounts)[number]
) {
  const profile = {
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
  };

  const byClerk = await prisma.user.findUnique({ where: { clerkId } });
  if (byClerk) {
    return prisma.user.update({
      where: { id: byClerk.id },
      data: profile,
    });
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: account.email },
  });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId, ...profile },
    });
  }

  return prisma.user.create({
    data: { clerkId, ...profile },
  });
}

async function seedClienteRichData(userId: string) {
  const meetingUrl =
    process.env.ZOOM_STATIC_MEETING_URL || "https://zoom.us/j/00000000000";

  const service = await prisma.service.findFirst({
    where: { slug: "individuel", isActive: true },
  });
  if (!service) {
    console.warn("  ⚠ Service individuel introuvable — lancez npm run db:seed");
    return;
  }

  const now = new Date();
  const upcomingDate = addDays(now, 7);
  const pastDate = addDays(now, -14);
  const reviewedDate = addDays(now, -21);
  const upcomingKey = formatDateKey(upcomingDate);

  await prisma.booking.deleteMany({
    where: { notes: { startsWith: "[DEMO]" } },
  });

  const upcomingBooking = await prisma.booking.create({
    data: {
      userId,
      serviceId: service.id,
      date: upcomingDate,
      startTime: "10:00",
      endTime: "11:00",
      status: "CONFIRMED",
      slotKey: slotKeyForStatus("CONFIRMED", upcomingKey, "10:00"),
      meetingUrl,
      notes: "[DEMO] سبب الحجز: التوتر والضغط",
    },
  });

  const pastBooking = await prisma.booking.create({
    data: {
      userId,
      serviceId: service.id,
      date: pastDate,
      startTime: "14:00",
      endTime: "15:00",
      status: "COMPLETED",
      slotKey: null,
      meetingUrl,
      notes: "[DEMO] جلسة مكتملة — en attente de تقييم",
    },
  });

  const reviewedBooking = await prisma.booking.create({
    data: {
      userId,
      serviceId: service.id,
      date: reviewedDate,
      startTime: "11:00",
      endTime: "12:00",
      status: "COMPLETED",
      slotKey: null,
      notes: "[DEMO] جلسة مكتملة مع تقييم",
      review: {
        create: {
          userId,
          rating: 5,
          comment: "جلسة مفيدة جدًا، شعرتُ بوضوح أكبر بعدها.",
        },
      },
    },
  });

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    take: 2,
  });

  for (const [index, course] of courses.entries()) {
    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      update: { progress: index === 0 ? 42 : 15 },
      create: {
        userId,
        courseId: course.id,
        progress: index === 0 ? 42 : 15,
      },
    });

    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        courseId: course.id,
        providerPaymentId: { startsWith: "demo-" },
      },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "PAID", amount: course.price },
      });
    } else {
      await prisma.payment.create({
        data: {
          userId,
          courseId: course.id,
          amount: course.price,
          status: "PAID",
          provider: "PAYZONE",
          providerPaymentId: `demo-${course.slug}`,
        },
      });
    }

    const lessons = await prisma.courseLesson.findMany({
      where: { module: { courseId: course.id } },
      orderBy: { order: "asc" },
      take: index === 0 ? 2 : 1,
    });

    for (const lesson of lessons) {
      await prisma.lessonCompletion.upsert({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        update: {},
        create: { userId, lessonId: lesson.id },
      });
    }
  }

  const podcast = await prisma.podcast.findFirst({
    where: { slug: "premiers-pas", isPublished: true },
  });
  if (podcast) {
    await prisma.podcastListenProgress.upsert({
      where: {
        userId_podcastId: { userId, podcastId: podcast.id },
      },
      update: {
        positionSeconds: 320,
        durationSeconds: 1500,
      },
      create: {
        userId,
        podcastId: podcast.id,
        positionSeconds: 320,
        durationSeconds: 1500,
      },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.moodCheckIn.upsert({
    where: { userId_checkInDate: { userId, checkInDate: today } },
    update: { mood: "happy", note: "[DEMO] أشعر بهدوء اليوم." },
    create: {
      userId,
      checkInDate: today,
      mood: "happy",
      note: "[DEMO] أشعر بهدوء اليوم.",
    },
  });

  await prisma.goal.deleteMany({
    where: { userId, title: { startsWith: "[DEMO]" } },
  });
  await prisma.goal.createMany({
    data: [
      {
        userId,
        title: "[DEMO] استعادة الثقة بالنفس",
        description: "التحدث بثقة في الاجتماعات المهنية.",
        progress: 67,
        targetDate: addDays(now, 90),
      },
      {
        userId,
        title: "[DEMO] إدارة التوتر",
        description: "ممارسة التنفس يوميًا.",
        progress: 40,
        targetDate: addDays(now, 60),
      },
    ],
  });

  await prisma.journalEntry.deleteMany({
    where: { userId, content: { startsWith: "[DEMO]" } },
  });
  await prisma.journalEntry.createMany({
    data: [
      {
        userId,
        mood: "happy",
        content: "[DEMO] اليوم شعرتُ بتقدم حقيقي في حدودي الشخصية.",
      },
      {
        userId,
        mood: "neutral",
        content: "[DEMO] يوم هادئ، ركزت على التخطيط للأسبوع القادم.",
      },
    ],
  });

  console.log("  ✓ Données cliente :");
  console.log(`    - جلسة قادمة (${upcomingBooking.id.slice(0, 8)}…)`);
  console.log(`    - جلسة للتقييم (${pastBooking.id.slice(0, 8)}…)`);
  console.log(`    - جلسة مُقيَّمة (${reviewedBooking.id.slice(0, 8)}…)`);
  console.log(`    - ${courses.length} دورات + مدفوعات + مكتبتي`);
  console.log("    - متابعة بودكاست + humeur + objectifs + journal");
}

async function main() {
  console.log("Création des comptes démo (Clerk + Prisma)…\n");

  requireEnv("CLERK_SECRET_KEY");
  requireEnv("DATABASE_URL");

  for (const account of demoUserAccounts) {
    console.log(`→ ${account.email} (${account.description})`);
    const clerkId = await upsertClerkUser(account);
    const dbUser = await upsertDbUser(clerkId, account);
    console.log(`  ✓ Prisma : ${dbUser.id}`);

    if (account.key === "cliente") {
      await seedClienteRichData(dbUser.id);
    }

    if (account.key === "cliente-nouvelle") {
      await prisma.booking.deleteMany({
        where: { userId: dbUser.id, notes: { startsWith: "[DEMO]" } },
      });
      await prisma.courseEnrollment.deleteMany({ where: { userId: dbUser.id } });
      await prisma.payment.deleteMany({
        where: { userId: dbUser.id, providerPaymentId: { startsWith: "demo-" } },
      });
      console.log("  ✓ Compte vierge (parcours nouvelle cliente)");
    }

    console.log("");
  }

  console.log("Terminé. Identifiants : docs/comptes-demo.md");
  console.log("Connexion : /sign-in");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
