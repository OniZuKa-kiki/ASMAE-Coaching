import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";

function roleFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined
): string | undefined {
  // Clerk session token should include: { "metadata": "{{user.public_metadata}}" }
  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  if (metadata?.role) return metadata.role;

  const publicMetadata = sessionClaims?.publicMetadata as
    | { role?: string }
    | undefined;
  return publicMetadata?.role;
}

export async function getUserRole(): Promise<string | undefined> {
  const { sessionClaims } = await auth();
  const fromClaims = roleFromClaims(sessionClaims as Record<string, unknown>);
  if (fromClaims) return fromClaims;

  const clerkUser = await currentUser();
  const fromClerk = (clerkUser?.publicMetadata as { role?: string } | undefined)
    ?.role;
  if (fromClerk) return fromClerk;

  const unsafeRole = (clerkUser?.unsafeMetadata as { role?: string } | undefined)
    ?.role;
  return unsafeRole;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  if (role === "admin") return true;

  const user = await getOrCreateUser();
  return user?.role === "ADMIN";
}
