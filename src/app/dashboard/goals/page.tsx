import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import {
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getUserGoals } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function createGoal(formData: FormData): Promise<ActionResult> {
  "use server";
  const user = await requireUser();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetDateRaw = String(formData.get("targetDate") || "").trim();

  if (!title) return incomplete("ar");

  return runAction("ar", async () => {
    await prisma.goal.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
        progress: 0,
        isCompleted: false,
      },
    });
    revalidatePath("/dashboard/goals");
    revalidatePath("/dashboard");
  }, "created");
}

export default async function DashboardGoalsPage() {
  const goals = await getUserGoals();

  return (
    <div>
      <h1 className="page-header-title mb-2">أهدافي</h1>
      <p className="text-text/70 mb-8">
        حدّد أهدافك وتابع تقدمك مع مدربتك.
      </p>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">إضافة هدف</h2>
        <ActionForm action={createGoal} className="space-y-3">
          <input
            name="title"
            placeholder="عنوان الهدف"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            placeholder="الوصف (اختياري)"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
          />
          <input
            name="targetDate"
            type="date"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            حفظ
          </button>
        </ActionForm>
      </Card>
      {!goals || goals.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">
            ستُحدَّد أهدافك معاً خلال جلستك الأولى.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{goal.title}</p>
                  {goal.description && (
                    <p className="text-sm text-text/70 mt-1">{goal.description}</p>
                  )}
                  <p className="text-xs text-text/60 mt-2">
                    {goal.targetDate
                      ? `التاريخ المستهدف: ${formatDate(goal.targetDate)}`
                      : "بدون تاريخ مستهدف"}
                  </p>
                </div>
                <div className="min-w-[180px]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text/70">التقدم</span>
                    <span className="font-semibold text-primary">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/dashboard/goals/${goal.id}/edit`}
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
