import { auth } from "@clerk/nextjs/server";

export async function getUserRole(): Promise<string | undefined> {
  const { sessionClaims } = await auth();

  const metadata = sessionClaims?.metadata as { role?: string } | undefined;
  if (metadata?.role) return metadata.role;

  const publicMetadata = sessionClaims?.publicMetadata as
    | { role?: string }
    | undefined;
  return publicMetadata?.role;
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}
