import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function getOrCreateUser(): Promise<User | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
  const isAdmin = (metadata?.role || publicMetadata?.role) === "admin";
  const dbRole = isAdmin ? ("ADMIN" as const) : ("CLIENT" as const);

  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (existing) {
    if (existing.role !== dbRole) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { role: dbRole },
      });
    }
    return existing;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      email,
      role: dbRole,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role: dbRole,
    },
  });
}

export async function requireUser(): Promise<User> {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Non authentifié");
  return user;
}
