import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export const dynamic = "force-dynamic";

async function updateGoal(formData: FormData) {
  "use server";
  const user = await requireUser();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const targetDateRaw = String(formData.get("targetDate") || "").trim();
  const progressRaw = Number(String(formData.get("progress") || ""));
  const isCompleted = String(formData.get("isCompleted") || "") === "on";

  if (!id || !title) return;
  const progress = Number.isFinite(progressRaw)
    ? Math.max(0, Math.min(100, Math.round(progressRaw)))
    : 0;

  await prisma.goal.updateMany({
    where: { id, userId: user.id },
    data: {
      title,
      description: description || null,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
      progress,
      isCompleted,
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  redirect("/dashboard/goals");
}

async function deleteGoal(formData: FormData) {
  "use server";
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.goal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
  redirect("/dashboard/goals");
}

export default async function DashboardGoalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) notFound();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">
          تعديل الهدف
        </h1>
        <Link
          href="/dashboard/goals"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <Card>
        <form action={updateGoal} className="space-y-3">
          <input type="hidden" name="id" value={goal.id} />
          <input
            name="title"
            defaultValue={goal.title}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            defaultValue={goal.description ?? ""}
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="targetDate"
              type="date"
              defaultValue={goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : ""}
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <input
              name="progress"
              type="number"
              min="0"
              max="100"
              defaultValue={goal.progress}
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-text">
            <input type="checkbox" name="isCompleted" defaultChecked={goal.isCompleted} />
            الهدف مكتمل
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              حفظ
            </button>
            <button
              type="submit"
              formAction={deleteGoal}
              className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              حذف
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

