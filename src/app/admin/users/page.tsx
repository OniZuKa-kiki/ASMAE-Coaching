import { Card } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = getQueryValue(params.q).trim();
  const role = getQueryValue(params.role).trim();
  const sort = getQueryValue(params.sort, "created_desc");

  const where = {
    ...(role === "ADMIN" || role === "CLIENT"
      ? { role: role as "ADMIN" | "CLIENT" }
      : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "created_asc"
      ? ({ createdAt: "asc" } as const)
      : sort === "email_asc"
      ? ({ email: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const users = await prisma.user.findMany({
    where,
    include: {
      intakeForms: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, createdAt: true },
      },
      _count: {
        select: {
          bookings: true,
          enrollments: true,
          payments: true,
        },
      },
    },
    orderBy,
    take: 100,
  });

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">Clients</h1>
      <Card className="mb-6">
        <form method="GET" className="grid md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher nom ou email..."
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <FilterSelect
            name="role"
            value={role}
            options={[
              { value: "", label: "Tous rôles" },
              { value: "CLIENT", label: "CLIENT" },
              { value: "ADMIN", label: "ADMIN" },
            ]}
          />
          <FilterSelect
            name="sort"
            value={sort}
            options={[
              { value: "created_desc", label: "Plus récents" },
              { value: "created_asc", label: "Plus anciens" },
              { value: "email_asc", label: "Email A→Z" },
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
      {users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">Aucun client pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-heading">
                    {user.firstName || ""} {user.lastName || ""}{" "}
                    {!user.firstName && !user.lastName ? "Client" : ""}
                  </p>
                  <p className="text-sm text-text/70">{user.email}</p>
                  <p className="text-xs text-text/60">
                    Inscrit le {formatDate(user.createdAt)} • Rôle: {user.role}
                  </p>
                </div>
                <div className="text-sm text-text/70">
                  <p>Réservations: {user._count.bookings}</p>
                  <p>Formations: {user._count.enrollments}</p>
                  <p>Paiements: {user._count.payments}</p>
                  {user.intakeForms[0] ? (
                    <Link
                      href={`/admin/settings/intake-forms?q=${encodeURIComponent(user.email)}`}
                      className="inline-block mt-2 text-primary font-medium hover:underline"
                    >
                      Voir questionnaire ({formatDate(user.intakeForms[0].createdAt)})
                    </Link>
                  ) : (
                    <p className="mt-2 text-text/50">Questionnaire non rempli</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
