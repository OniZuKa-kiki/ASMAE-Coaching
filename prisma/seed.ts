import { PrismaClient } from "@prisma/client";
import { siteConfig } from "../src/lib/constants";
import { SITE_SETTINGS_ID } from "../src/lib/site-settings";
import {
  SAMPLE_AUDIO_URL,
  SAMPLE_VIDEO_URL,
  seedBlogPosts,
  seedCourseModules,
  seedCourses,
  seedPodcasts,
  seedServices,
  seedTestimonials,
} from "./seed-data";

const prisma = new PrismaClient();

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

async function main() {
  console.log("Seeding database...");

  for (const service of seedServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        description: service.description,
        duration: parseDuration(service.duration),
        price: service.price,
        isActive: true,
      },
      create: {
        slug: service.slug,
        title: service.title,
        description: service.description,
        duration: parseDuration(service.duration),
        price: service.price,
        isActive: true,
      },
    });
  }

  for (const course of seedCourses) {
    const record = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        price: course.price,
        topics: course.topics,
        isPublished: true,
      },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        price: course.price,
        topics: course.topics,
        isPublished: true,
      },
    });

    const modules = seedCourseModules[course.slug];
    if (modules) {
      await prisma.courseModule.deleteMany({ where: { courseId: record.id } });
      for (const [moduleIndex, mod] of modules.entries()) {
        const module = await prisma.courseModule.create({
          data: {
            courseId: record.id,
            title: mod.title,
            order: moduleIndex + 1,
          },
        });
        for (const [lessonIndex, lesson] of mod.lessons.entries()) {
          const category = lesson.resourceCategory ?? "VIDEO";
          const videoUrl =
            category === "AUDIO"
              ? SAMPLE_AUDIO_URL
              : category === "VIDEO" || category === "EXERCISE"
                ? SAMPLE_VIDEO_URL
                : null;
          const pdfUrl =
            category === "PDF" ||
            category === "DOWNLOAD" ||
            category === "SHEET"
              ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              : null;

          await prisma.courseLesson.create({
            data: {
              moduleId: module.id,
              title: lesson.title,
              description: lesson.description,
              videoUrl,
              pdfUrl,
              resourceCategory: category,
              order: lessonIndex + 1,
              duration: category === "AUDIO" ? 10 : 12,
            },
          });
        }
      }
    }
  }

  for (const post of seedBlogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        isPublished: true,
        publishedAt: post.publishedAt,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        isPublished: true,
        publishedAt: post.publishedAt,
      },
    });
  }

  for (const podcast of seedPodcasts) {
    await prisma.podcast.upsert({
      where: { slug: podcast.slug },
      update: {
        title: podcast.title,
        description: podcast.description,
        duration: podcast.duration,
        audioUrl: SAMPLE_AUDIO_URL,
        isPremium: podcast.isPremium,
        topics: podcast.topics,
        isPublished: true,
      },
      create: {
        slug: podcast.slug,
        title: podcast.title,
        description: podcast.description,
        duration: podcast.duration,
        audioUrl: SAMPLE_AUDIO_URL,
        isPremium: podcast.isPremium,
        topics: podcast.topics,
        isPublished: true,
      },
    });
  }

  await prisma.testimonial.deleteMany();
  for (const testimonial of seedTestimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  await prisma.coupon.upsert({
    where: { code: "BIENVENUE10" },
    update: { isActive: true },
    create: {
      code: "BIENVENUE10",
      discountPercent: 10,
      maxUses: 100,
      isActive: true,
      expiresAt: new Date("2027-12-31"),
    },
  });

  const users = await prisma.user.findMany();
  const publishedCourses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });

  for (const user of users) {
    const existingGoals = await prisma.goal.count({ where: { userId: user.id } });
    if (existingGoals === 0) {
      await prisma.goal.createMany({
        data: [
          {
            userId: user.id,
            title: "استعادة الثقة بالنفس",
            description:
              "التحدث بثقة والتعبير عن احتياجاتي بوضوح.",
            progress: 35,
            isCompleted: false,
            targetDate: new Date("2026-09-30"),
          },
          {
            userId: user.id,
            title: "إدارة أفضل للتوتر اليومي",
            description: "وضع روتين للتنفس والاسترخاء.",
            progress: 60,
            isCompleted: false,
            targetDate: new Date("2026-08-31"),
          },
        ],
      });
    }

    const existingJournal = await prisma.journalEntry.count({
      where: { userId: user.id },
    });
    if (existingJournal === 0) {
      await prisma.journalEntry.createMany({
        data: [
          {
            userId: user.id,
            mood: "هادئ",
            content:
              "هذا الأسبوع، نجحت في قول لا دون شعور بالذنب. أشعر بتناغم أكبر مع نفسي.",
          },
          {
            userId: user.id,
            mood: "متحفز",
            content:
              "أتقدم بشكل أفضل عندما أقسم أهدافي إلى خطوات يومية صغيرة.",
          },
        ],
      });
    }

    const existingEnrollments = await prisma.courseEnrollment.count({
      where: { userId: user.id },
    });

    if (existingEnrollments === 0 && publishedCourses.length > 0) {
      const demoCourses = publishedCourses.slice(0, Math.min(2, publishedCourses.length));
      await prisma.courseEnrollment.createMany({
        data: demoCourses.map((course: { id: string }, index: number) => ({
          userId: user.id,
          courseId: course.id,
          progress: index === 0 ? 35 : 10,
        })),
        skipDuplicates: true,
      });
    }
  }

  await prisma.availability.deleteMany();
  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    await prisma.availability.create({
      data: {
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {
      contactEmail: siteConfig.contact.email,
      contactPhone: siteConfig.contact.phone,
      whatsappUrl: siteConfig.contact.whatsapp,
      instagramUrl: siteConfig.contact.instagram,
      instagramHandle: "asmae_coaching",
      localeArEnabled: true,
      localeFrEnabled: false,
    },
    create: {
      id: SITE_SETTINGS_ID,
      contactEmail: siteConfig.contact.email,
      contactPhone: siteConfig.contact.phone,
      whatsappUrl: siteConfig.contact.whatsapp,
      instagramUrl: siteConfig.contact.instagram,
      instagramHandle: "asmae_coaching",
      localeArEnabled: true,
      localeFrEnabled: false,
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
