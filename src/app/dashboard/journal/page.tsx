import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { getUserJournalEntries } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function createJournalEntry(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const content = String(formData.get("content") || "").trim();
  const mood = String(formData.get("mood") || "").trim();
  if (!content) return incomplete("ar");

  return runAction("ar", async () => {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        content,
        mood: mood || null,
      },
    });
    revalidatePath("/dashboard/journal");
  }, "created");
}

export default async function DashboardJournalPage() {
  const entries = await getUserJournalEntries();

  return (
    <div>
      <h1 className="page-header-title mb-2">اليوميات الشخصية</h1>
      <p className="text-text/70 mb-8">
        دوّن تأملاتك بين الجلسات. مرئية لك ولمدربتك فقط.
      </p>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">ملاحظة جديدة</h2>
        <ActionForm action={createJournalEntry} className="space-y-3">
          <input
            name="mood"
            placeholder="المزاج (مثال: متحفز، هادئ...)"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
          />
          <textarea
            name="content"
            placeholder="اكتب ملاحظتك..."
            rows={5}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            إضافة
          </button>
        </ActionForm>
      </Card>
      {!entries || entries.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">
            ستكون يومياتك متاحة بعد جلستك الأولى.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-xs text-text/60">{formatDate(entry.createdAt)}</p>
                {entry.mood && (
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    المزاج: {entry.mood}
                  </span>
                )}
              </div>
              <p className="text-text whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
              <div className="mt-4">
                <Link
                  href={`/dashboard/journal/${entry.id}/edit`}
                  className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                >
                  تعديل
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
