import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { JournalEntryList } from "@/components/dashboard/journal-entry-list";
import { JournalNewEntry } from "@/components/dashboard/journal-new-entry";
import { Card } from "@/components/ui/card";
import { getActionLocale } from "@/lib/action-locale";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { getUserJournalEntries } from "@/lib/dashboard";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { isJournalMoodId } from "@/lib/journal-moods";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/journal",
    namespace: "dashboard.journal",
    titleKey: "pageTitle",
    descriptionKey: "pageSubtitle",
  });
}

async function createJournalEntry(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const locale = await getActionLocale(user.preferredLocale);
  const content = String(formData.get("content") || "").trim();
  const moodRaw = String(formData.get("mood") || "").trim();
  const mood =
    moodRaw && isJournalMoodId(moodRaw) ? moodRaw : moodRaw || null;
  if (!content) return incomplete(locale);

  return runAction(locale, async () => {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content,
        mood,
      },
    });
    revalidatePath("/dashboard/journal");
  }, "created");
}

export default async function DashboardJournalPage() {
  const [entries, t] = await Promise.all([
    getUserJournalEntries(),
    getTranslations("dashboard.journal"),
  ]);

  const items =
    entries?.map((entry) => ({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
    })) ?? [];

  return (
    <div>
      <h1 className="page-header-title mb-2">{t("pageTitle")}</h1>
      <p className="text-text/70 mb-6">{t("pageSubtitle")}</p>

      <JournalNewEntry action={createJournalEntry} />

      {items.length === 0 ? (
        <Card className="text-center py-12 mt-6">
          <p className="text-text/70">{t("pageEmpty")}</p>
        </Card>
      ) : (
        <div className="mt-6">
          <JournalEntryList entries={items} />
        </div>
      )}
    </div>
  );
}
