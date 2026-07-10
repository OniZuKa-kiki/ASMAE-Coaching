import { revalidatePath } from "next/cache";
import { JournalEntryList } from "@/components/dashboard/journal-entry-list";
import { JournalNewEntry } from "@/components/dashboard/journal-new-entry";
import { Card } from "@/components/ui/card";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { getUserJournalEntries } from "@/lib/dashboard";
import { isJournalMoodId } from "@/lib/journal-moods";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

async function createJournalEntry(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  const moodRaw = String(formData.get("mood") || "").trim();
  const mood =
    moodRaw && isJournalMoodId(moodRaw) ? moodRaw : moodRaw || null;
  if (!content) return incomplete("ar");

  return runAction("ar", async () => {
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
  const entries = await getUserJournalEntries();

  const items =
    entries?.map((entry) => ({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
    })) ?? [];

  return (
    <div>
      <h1 className="page-header-title mb-2">يومياتي</h1>
      <p className="text-text/70 mb-6">
        دوّني تأملاتكِ بين الجلسات. مرئية لكِ ولمدربتك فقط.
      </p>

      <JournalNewEntry action={createJournalEntry} />

      {items.length === 0 ? (
        <Card className="text-center py-12 mt-6">
          <p className="text-text/70">
            ابدئي بملاحظة جديدة لمشاركة ما يمرّ بكِ بين الجلسات.
          </p>
        </Card>
      ) : (
        <div className="mt-6">
          <JournalEntryList entries={items} />
        </div>
      )}
    </div>
  );
}
