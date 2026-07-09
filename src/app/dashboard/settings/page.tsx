import { Card } from "@/components/ui/card";
import { ActionForm } from "@/components/ui/action-form";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

async function getUserIntakeForm(userId: string) {
  return prisma.intakeForm.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function saveIntakeForm(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();

  const goals = String(formData.get("goals") || "").trim();
  const challenges = String(formData.get("challenges") || "").trim();
  const expectations = String(formData.get("expectations") || "").trim();

  if (!goals || !challenges || !expectations) return incomplete("ar");

  return runAction("ar", async () => {
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
  const user = await requireUser();
  const intake = await getUserIntakeForm(user.id);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        الإعدادات
      </h1>

      <div className="space-y-6">
        <Card>
          <p className="text-text/70">
            يتيح لك هذا القسم الاستعداد لمرافقتك ومشاركة المعلومات المفيدة
            قبل جلستك القادمة.
          </p>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-2">
            استبيان ما قبل الجلسة الأولى
          </h2>
          <p className="text-text/70 text-sm mb-6">
            املأ هذه المعلومات لمساعدة مدربتك على إعداد مرافقة شخصية.
          </p>

          <ActionForm action={saveIntakeForm} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-heading">
                أهدافك (حالياً)
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
                تحدياتك / العوائق
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
                توقعاتك
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
                {intake ? "تحديث" : "حفظ"}
              </button>
            </div>
          </ActionForm>
        </Card>
      </div>
    </div>
  );
}
