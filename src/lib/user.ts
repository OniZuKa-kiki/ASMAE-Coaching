import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

function resolveDbRole(sessionClaims: Record<string, unknown> | null | undefined) {
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const isAdmin = (metadata?.role || publicMetadata?.role) === "admin";
  return isAdmin ? ("ADMIN" as const) : ("CLIENT" as const);
}

export async function getOrCreateUser(): Promise<User | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const dbRole = resolveDbRole(sessionClaims as Record<string, unknown>);

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const profile = {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    role: dbRole,
  };

  return prisma.$transaction(async (tx) => {
    const byClerk = await tx.user.findUnique({ where: { clerkId: userId } });
    if (byClerk) {
      if (byClerk.email !== email || byClerk.role !== dbRole) {
        return tx.user.update({
          where: { id: byClerk.id },
          data: { email, ...profile },
        });
      }
      return byClerk;
    }

    const byEmail = await tx.user.findUnique({ where: { email } });
    if (byEmail) {
      // Ancien enregistrement (seed / autre instance Clerk) — relier au bon clerkId
      const staleClerkRow = await tx.user.findUnique({ where: { clerkId: userId } });
      if (staleClerkRow && staleClerkRow.id !== byEmail.id) {
        await tx.user.delete({ where: { id: staleClerkRow.id } });
      }
      return tx.user.update({
        where: { id: byEmail.id },
        data: { clerkId: userId, ...profile },
      });
    }

    try {
      return await tx.user.create({
        data: { clerkId: userId, email, ...profile },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const linked = await tx.user.findFirst({
          where: { OR: [{ clerkId: userId }, { email }] },
        });
        if (linked) return linked;
      }
      throw error;
    }
  });
}

export async function requireUser(): Promise<User> {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Non authentifié");
  return user;
}
