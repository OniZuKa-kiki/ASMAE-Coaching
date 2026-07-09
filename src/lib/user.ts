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

  const existingByClerk = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (existingByClerk) {
    if (existingByClerk.role !== dbRole) {
      return prisma.user.update({
        where: { id: existingByClerk.id },
        data: { role: dbRole },
      });
    }
    return existingByClerk;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const profile = {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    role: dbRole,
  };

  // Même email, nouveau clerkId (ex. compte dev Clerk → prod Clerk, ou re-inscription)
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clerkId: userId, ...profile },
    });
  }

  try {
    return await prisma.user.create({
      data: { clerkId: userId, email, ...profile },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const linked = await prisma.user.findFirst({
        where: { OR: [{ clerkId: userId }, { email }] },
      });
      if (linked) return linked;
    }
    throw error;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Non authentifié");
  return user;
}
