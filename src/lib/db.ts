import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient();
}

function isPrismaClientReady(client: PrismaClient) {
  const extended = client as PrismaClient & {
    notification?: unknown;
    favorite?: unknown;
    searchQueryStat?: unknown;
  };
  return (
    typeof extended.notification !== "undefined" &&
    typeof extended.favorite !== "undefined" &&
    typeof extended.searchQueryStat !== "undefined"
  );
}

const cached = globalForPrisma.prisma;
export const prisma =
  cached && isPrismaClientReady(cached) ? cached : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
