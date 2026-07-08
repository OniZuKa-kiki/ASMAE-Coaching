import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function updatePodcast(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = Number(String(formData.get("duration") || ""));
  const isPremium = String(formData.get("isPremium") || "") === "on";
  const isPublished = String(formData.get("isPublished") || "") === "on";

  if (!id || !title || !description) return;

  const baseSlug = slugify(title);
  const conflict = await prisma.podcast.findFirst({
    where: { slug: baseSlug, id: { not: id } },
    select: { id: true },
  });
  const slug = conflict ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  await prisma.podcast.update({
    where: { id },
    data: {
      title,
      description,
      slug,
      audioUrl: audioUrl || null,
      duration: Number.isFinite(durationRaw) && durationRaw > 0 ? Math.round(durationRaw) : null,
      isPremium,
      isPublished,
    },
  });

  revalidatePath("/admin/podcasts");
  revalidatePath("/podcasts");
  redirect("/admin/podcasts");
}

async function deletePodcast(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") return;

  const id = String(formData.get("id") || "");
  if (!id) return;

  await prisma.podcast.delete({ where: { id } });
  revalidatePath("/admin/podcasts");
  revalidatePath("/podcasts");
  redirect("/admin/podcasts");
}

export default async function AdminPodcastEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const podcast = await prisma.podcast.findUnique({ where: { id } });
  if (!podcast) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Modifier le podcast
          </h1>
          <p className="text-sm text-text/70 mt-1">Slug: {podcast.slug}</p>
        </div>
        <Link
          href="/admin/podcasts"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <Card>
        <form action={updatePodcast} className="space-y-3">
          <input type="hidden" name="id" value={podcast.id} />

          <input
            name="title"
            defaultValue={podcast.title}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            defaultValue={podcast.description}
            rows={5}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="audioUrl"
              defaultValue={podcast.audioUrl ?? ""}
              placeholder="URL audio (.mp3/.m4a)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <input
              name="duration"
              type="number"
              min="1"
              defaultValue={podcast.duration ?? ""}
              placeholder="Durée (minutes)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-text">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isPremium" defaultChecked={podcast.isPremium} />
              Premium
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked={podcast.isPublished} />
              Publié
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="submit"
              formAction={deletePodcast}
              className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

