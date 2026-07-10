import { revalidatePath } from "next/cache";
import { AdminFormField } from "@/components/admin/form-field";
import { GoalsList } from "@/components/dashboard/goals-list";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import {
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { getUserGoals } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

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

  const items =
    goals?.map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate?.toISOString() ?? null,
      progress: goal.progress,
      isCompleted: goal.isCompleted,
      updatedAt: goal.updatedAt.toISOString(),
    })) ?? [];

  return (
    <div>
      <h1 className="page-header-title mb-2">أهدافي</h1>
      <p className="text-text/70 mb-8">
        حدّدي أهدافكِ وتابعي تقدمكِ مع مدربتك.
      </p>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">إضافة هدف</h2>
        <ActionForm action={createGoal} className="space-y-4">
          <AdminFormField label="عنوان الهدف" htmlFor="goal-title">
            <Input id="goal-title" name="title" className="w-full" required />
          </AdminFormField>
          <AdminFormField label="الوصف (اختياري)" htmlFor="goal-description">
            <Textarea id="goal-description" name="description" rows={3} className="w-full" />
          </AdminFormField>
          <AdminFormField label="التاريخ المستهدف (اختياري)" htmlFor="goal-target-date">
            <Input id="goal-target-date" name="targetDate" type="date" className="w-full" />
          </AdminFormField>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            حفظ
          </button>
        </ActionForm>
      </Card>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">
            ستُحدَّد أهدافكِ معًا خلال جلستكِ الأولى.
          </p>
        </Card>
      ) : (
        <GoalsList goals={items} />
      )}
    </div>
  );
}
