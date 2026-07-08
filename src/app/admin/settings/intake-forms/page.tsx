import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { prisma } from "@/lib/db";
import { getUserRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminIntakeFormsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const sort = getQueryValue(params.sort, "newest");

  const where = q
    ? {
        user: {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
          ],
        },
      }
    : undefined;

  const orderBy =
    sort === "oldest"
      ? ({ createdAt: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const forms = await prisma.intakeForm.findMany({
    where,
    include: { user: true },
    orderBy,
    take: 100,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Questionnaires clients
          </h1>
          <p className="text-sm text-text/70 mt-1">
            Réponses partagées avant la première séance.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-3 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher client (nom, email)..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "newest", label: "Plus récents" },
              { value: "oldest", label: "Plus anciens" },
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

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucune réponse pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const fullName = `${form.user.firstName ?? ""} ${form.user.lastName ?? ""}`.trim();
            return (
              <Card key={form.id}>
                <div className="mb-4">
                  <p className="font-semibold text-heading">
                    {fullName || "Client"} — {form.user.email}
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    Reçu le {formatDate(form.createdAt)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">Objectifs</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.goals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">Défis / blocages</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.challenges}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-heading mb-1">Attentes</p>
                    <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {form.expectations}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

