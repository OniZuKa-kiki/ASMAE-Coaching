import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { AdminFormField } from "@/components/admin/form-field";
import { JournalMoodPicker } from "@/components/dashboard/journal-mood-picker";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { getActionLocale } from "@/lib/action-locale";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { isJournalMoodId } from "@/lib/journal-moods";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/journal",
    namespace: "dashboard.journal",
    titleKey: "editTitle",
    descriptionKey: "pageSubtitle",
  });
}

async function updateJournalEntry(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const locale = await getActionLocale(user.preferredLocale);
  const id = String(formData.get("id") || "");
  const content = String(formData.get("content") || "").trim();
  const moodRaw = String(formData.get("mood") || "").trim();
  const mood =
    moodRaw && isJournalMoodId(moodRaw) ? moodRaw : moodRaw || null;
  if (!id || !content) return incomplete(locale);

  return runAction(
    locale,
    async () => {
      await prisma.journalEntry.updateMany({
        where: { id, userId: user.id },
        data: { content, mood },
      });
      revalidatePath("/dashboard/journal");
    },
    "updated",
    "/dashboard/journal"
  );
}

async function deleteJournalEntry(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const locale = await getActionLocale(user.preferredLocale);
  const id = String(formData.get("id") || "");
  if (!id) return incomplete(locale);

  return runAction(
    locale,
    async () => {
      await prisma.journalEntry.deleteMany({ where: { id, userId: user.id } });
      revalidatePath("/dashboard/journal");
    },
    "deleted",
    "/dashboard/journal"
  );
}

export default async function DashboardJournalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard/journal");

  const { id } = await params;
  const [entry, t, tCommon, tSettings] = await Promise.all([
    prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
    }),
    getTranslations("dashboard.journal"),
    getTranslations("common"),
    getTranslations("dashboard.settings"),
  ]);
  if (!entry) notFound();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">{t("editTitle")}</h1>
        <Link
          href="/dashboard/journal"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          {tCommon("back")}
        </Link>
      </div>

      <Card>
        <ActionForm action={updateJournalEntry} className="space-y-5">
          <input type="hidden" name="id" value={entry.id} />
          <JournalMoodPicker defaultValue={entry.mood} />
          <AdminFormField label={t("contentLabel")} htmlFor="edit-journal-content">
            <Textarea
              id="edit-journal-content"
              name="content"
              defaultValue={entry.content}
              rows={10}
              className="w-full resize-none"
              required
            />
          </AdminFormField>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            {tSettings("save")}
          </button>
        </ActionForm>

        <ActionForm action={deleteJournalEntry} className="mt-3">
          <input type="hidden" name="id" value={entry.id} />
          <button
            type="submit"
            className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            {tCommon("delete")}
          </button>
        </ActionForm>
      </Card>
    </div>
  );
}
