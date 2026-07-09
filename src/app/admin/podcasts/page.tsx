import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { adminErrors } from "@/lib/api-errors";
import {
  ensureAdmin,
  incomplete,
  runAction,
  type ActionResult,
} from "@/lib/action-result";
import { prisma } from "@/lib/db";

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

async function createPodcast(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const audioUrl = String(formData.get("audioUrl") || "").trim();
  const durationRaw = String(formData.get("duration") || "").trim();
  const isPremium = String(formData.get("isPremium") || "") === "on";

  if (!title || !description) return incomplete("fr");

  return runAction("fr", async () => {
    const baseSlug = slugify(title);
    const exists = await prisma.podcast.findUnique({ where: { slug: baseSlug } });
    const slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const duration = durationRaw ? Number(durationRaw) : null;

    await prisma.podcast.create({
      data: {
        slug,
        title,
        description,
        audioUrl: audioUrl || null,
        duration: Number.isFinite(duration) ? duration : null,
        isPremium,
        isPublished: false,
      },
    });

    revalidatePath("/admin/podcasts");
    revalidatePath("/podcasts");
  }, "created");
}

async function togglePodcastState(formData: FormData): Promise<ActionResult> {
  "use server";

  const denied = await ensureAdmin();
  if (denied) return denied;

  const id = String(formData.get("id") || "");
  const field = String(formData.get("field") || "");
  if (!id || !field) return incomplete("fr");

  return runAction("fr", async () => {
    const podcast = await prisma.podcast.findUnique({ where: { id } });
    if (!podcast) throw new Error(adminErrors.notFound);

    if (field === "publish") {
      await prisma.podcast.update({
        where: { id },
        data: { isPublished: !podcast.isPublished },
      });
    } else if (field === "premium") {
      await prisma.podcast.update({
        where: { id },
        data: { isPremium: !podcast.isPremium },
      });
    } else {
      throw new Error(adminErrors.notFound);
    }

    revalidatePath("/admin/podcasts");
    revalidatePath("/podcasts");
  }, "toggled");
}

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminPodcastsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const published = getQueryValue(params.published).trim();
  const premium = getQueryValue(params.premium).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(published === "yes"
      ? { isPublished: true }
      : published === "no"
      ? { isPublished: false }
      : {}),
    ...(premium === "yes"
      ? { isPremium: true }
      : premium === "no"
      ? { isPremium: false }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "title_asc"
      ? ({ title: "asc" } as const)
      : sort === "duration_desc"
      ? ({ duration: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const podcasts = await prisma.podcast.findMany({
    where,
    orderBy,
    take: 50,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        Podcasts
      </h1>
      <Card className="mb-6">
        <h2 className="font-heading text-xl text-heading mb-4">Nouveau podcast</h2>
        <p className="text-sm text-text/70 mb-4">
          `audioUrl` = lien direct vers un fichier audio (ex: `.mp3`/`.m4a`).
          Vous pouvez l&apos;obtenir en uploadant le fichier sur Supabase Storage,
          Cloudinary, BunnyCDN, ou S3, puis en copiant l&apos;URL publique.
        </p>
        <ActionForm action={createPodcast} locale="fr" className="space-y-3">
          <input
            name="title"
            placeholder="Titre"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3"
            required
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="audioUrl"
              placeholder="URL audio (.mp3)"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
            <input
              name="duration"
              placeholder="Durée (minutes)"
              type="number"
              min="1"
              className="w-full rounded-xl border border-border bg-card px-4 py-3"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-text">
            <input type="checkbox" name="isPremium" />
            Podcast premium
          </label>
          <div>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Créer le brouillon
            </button>
          </div>
        </ActionForm>
      </Card>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-5 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher titre ou slug..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="published"
            value={published}
            options={[
              { value: "", label: "Publié + brouillon" },
              { value: "yes", label: "Publiés" },
              { value: "no", label: "Brouillons" },
            ]}
          />
          <FilterSelect
            name="premium"
            value={premium}
            options={[
              { value: "", label: "Premium + gratuit" },
              { value: "yes", label: "Premium" },
              { value: "no", label: "Gratuit" },
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récents" },
              { value: "title_asc", label: "Titre A→Z" },
              { value: "duration_desc", label: "Durée ↓" },
            ]}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Filtrer
          </button>
        </form>
      </Card>

      {podcasts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucun podcast pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">{podcast.title}</p>
                  <p className="text-sm text-text/70">
                    /podcasts/{podcast.slug} • {podcast.duration ?? "—"} min
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/podcasts/${podcast.id}/edit`}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                  >
                    Éditer
                  </Link>
                  <ActionForm action={togglePodcastState} locale="fr">
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="premium" />
                    <button
                      type="submit"
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
                    >
                      {podcast.isPremium ? "Retirer premium" : "Passer premium"}
                    </button>
                  </ActionForm>
                  <ActionForm action={togglePodcastState} locale="fr">
                    <input type="hidden" name="id" value={podcast.id} />
                    <input type="hidden" name="field" value="publish" />
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {podcast.isPublished ? "Dépublier" : "Publier"}
                    </button>
                  </ActionForm>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
