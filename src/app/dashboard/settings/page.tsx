import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ActionForm } from "@/components/ui/action-form";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActionLocale } from "@/lib/action-locale";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { dashboardPageMetadata } from "@/lib/dashboard-metadata";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dashboardPageMetadata({
    path: "/dashboard/settings",
    namespace: "dashboard.settings",
    titleKey: "pageTitle",
    descriptionKey: "intro",
  });
}

async function getUserIntakeForm(userId: string) {
  return prisma.intakeForm.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function saveIntakeForm(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const locale = await getActionLocale(user.preferredLocale);

  const goals = String(formData.get("goals") || "").trim();
  const challenges = String(formData.get("challenges") || "").trim();
  const expectations = String(formData.get("expectations") || "").trim();

  if (!goals || !challenges || !expectations) return incomplete(locale);

  return runAction(locale, async () => {
    await prisma.intakeForm.deleteMany({ where: { userId: user.id } });
    await prisma.intakeForm.create({
      data: {
        userId: user.id,
        goals,
        challenges,
        expectations,
      },
    });
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
  }, "saved");
}

export default async function DashboardSettingsPage() {
  const [user, t] = await Promise.all([
    requireUser(),
    getTranslations("dashboard.settings"),
  ]);
  const intake = await getUserIntakeForm(user.id);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">{t("pageTitle")}</h1>

      <div className="space-y-6">
        <Card>
          <p className="text-text/70">{t("intro")}</p>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-2">
            {t("intakeTitle")}
          </h2>
          <p className="text-text/70 text-sm mb-6">{t("intakeSubtitle")}</p>

          <ActionForm action={saveIntakeForm} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-heading">
                {t("goalsLabel")}
              </label>
              <textarea
                name="goals"
                defaultValue={intake?.goals ?? ""}
                rows={5}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-heading">
                {t("challengesLabel")}
              </label>
              <textarea
                name="challenges"
                defaultValue={intake?.challenges ?? ""}
                rows={5}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-heading">
                {t("expectationsLabel")}
              </label>
              <textarea
                name="expectations"
                defaultValue={intake?.expectations ?? ""}
                rows={5}
                className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3"
                required
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
              >
                {intake ? t("update") : t("save")}
              </button>
            </div>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
