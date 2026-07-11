import type { FavoriteEntityType } from "@prisma/client";

export type FavoriteItem = {
  id: string;
  entityType: FavoriteEntityType;
  entityId: string;
  title: string;
  description: string | null;
  href: string;
  meta: string | null;
  createdAt: string;
};

export function favoriteKey(
  entityType: FavoriteEntityType,
  entityId: string
): string {
  return `${entityType}:${entityId}`;
}

export function isFavorited(
  favoriteKeys: Set<string> | string[],
  entityType: FavoriteEntityType,
  entityId: string
): boolean {
  const key = favoriteKey(entityType, entityId);
  if (favoriteKeys instanceof Set) return favoriteKeys.has(key);
  return favoriteKeys.includes(key);
}
