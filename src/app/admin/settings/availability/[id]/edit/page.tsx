import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dayOptions = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
];

async function updateAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const dayOfWeekRaw = String(formData.get("dayOfWeek") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const isActive = String(formData.get("isActive") || "") === "on";

  const dayOfWeek = Number(dayOfWeekRaw);
  if (!id || !startTime || !endTime) return incomplete("fr");
  if (!Number.isFinite(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return incomplete("fr");
  }

  return runAction(
    "fr",
    async () => {
      await prisma.availability.update({
        where: { id },
        data: {
          dayOfWeek,
          startTime,
          endTime,
          isActive,
        },
      });

      revalidatePath("/admin/settings/availability");
    },
    "updated",
    "/admin/settings/availability"
  );
}

async function deleteAvailability(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  if (!id) return incomplete("fr");

  return runAction(
    "fr",
    async () => {
      await prisma.availability.delete({ where: { id } });
      revalidatePath("/admin/settings/availability");
    },
    "deleted",
    "/admin/settings/availability"
  );
}

export default async function AdminAvailabilityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const row = await prisma.availability.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Modifier un créneau
          </h1>
          <p className="text-sm text-text/70 mt-1">
            {dayOptions.find((d) => d.value === row.dayOfWeek)?.label ?? row.dayOfWeek}
          </p>
        </div>
        <Link
          href="/admin/settings/availability"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <Card className="p-5">
        <ActionForm action={updateAvailability} locale="fr" className="grid md:grid-cols-5 gap-3">
          <input type="hidden" name="id" value={row.id} />

          <select
            name="dayOfWeek"
            defaultValue={row.dayOfWeek}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            {dayOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <input
            name="startTime"
            type="time"
            defaultValue={row.startTime}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            required
          />
          <input
            name="endTime"
            type="time"
            defaultValue={row.endTime}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            required
          />

          <label className="inline-flex items-center gap-2 text-sm text-text md:col-span-1">
            <input type="checkbox" name="isActive" defaultChecked={row.isActive} />
            Actif
          </label>

          <div className="flex gap-2 md:col-span-4 md:justify-end">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </ActionForm>

        <ActionForm action={deleteAvailability} locale="fr" className="mt-3 flex md:justify-end">
          <input type="hidden" name="id" value={row.id} />
          <button
            type="submit"
            className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Supprimer
          </button>
        </ActionForm>
      </Card>
    </div>
  );
}
