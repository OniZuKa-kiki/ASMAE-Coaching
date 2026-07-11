"use server";

import type { FavoriteEntityType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { toggleFavorite } from "@/lib/favorites";
import { requireUser } from "@/lib/user";

const favoriteEntityTypes = [
  "COURSE",
  "PODCAST",
  "BLOG_POST",
  "LESSON",
] as const;

function revalidateFavoritePaths(entityType: FavoriteEntityType) {
  revalidatePath("/dashboard/favorites");
  revalidatePath("/dashboard");

  switch (entityType) {
    case "COURSE":
      revalidatePath("/courses");
      revalidatePath("/dashboard/courses");
      break;
    case "PODCAST":
      revalidatePath("/podcasts");
      revalidatePath("/dashboard/podcasts");
      break;
    case "BLOG_POST":
      revalidatePath("/blog");
      break;
    case "LESSON":
      revalidatePath("/dashboard/resources");
      break;
  }
}

export async function toggleFavoriteAction(
  entityType: string,
  entityId: string
): Promise<{ ok: boolean; favorited: boolean }> {
  if (
    !entityId ||
    !favoriteEntityTypes.includes(entityType as (typeof favoriteEntityTypes)[number])
  ) {
    return { ok: false, favorited: false };
  }

  const user = await requireUser();
  const favorited = await toggleFavorite(
    user.id,
    entityType as FavoriteEntityType,
    entityId
  );

  revalidateFavoritePaths(entityType as FavoriteEntityType);

  return { ok: true, favorited };
}
