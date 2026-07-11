"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { FavoriteEntityType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { toggleFavoriteAction } from "@/lib/favorite-actions";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  entityType: FavoriteEntityType;
  entityId: string;
  initialFavorited?: boolean;
  signedIn?: boolean;
  className?: string;
  label?: string;
};

export function FavoriteButton({
  entityType,
  entityId,
  initialFavorited = false,
  signedIn = true,
  className,
  label,
}: FavoriteButtonProps) {
  const t = useTranslations("dashboard.favorites");
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        title={t("signInToSave")}
        aria-label={t("signInToSave")}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/90 text-text/50 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <Heart className="h-4 w-4" />
      </Link>
    );
  }

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavoriteAction(entityType, entityId);
      if (result.ok) {
        setFavorited(result.favorited);
        router.refresh();
      }
    });
  }

  const ariaLabel = favorited ? t("removeFromFavorites") : t("addToFavorites");

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={label ?? ariaLabel}
      aria-label={label ?? ariaLabel}
      aria-pressed={favorited}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors disabled:opacity-60",
        favorited
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border/70 bg-card/90 text-text/50 hover:border-primary/40 hover:text-primary",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
    </button>
  );
}
