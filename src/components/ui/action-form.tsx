"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { toFriendlyActionError } from "@/lib/api-errors";
import type { ActionLocale, ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

type ServerAction = (formData: FormData) => Promise<ActionResult | void>;

type ActionFormProps = {
  action: ServerAction;
  successMessage?: string;
  locale?: ActionLocale;
  redirectTo?: string;
  onSuccess?: () => void;
  className?: string;
  id?: string;
  children: React.ReactNode;
};

export function ActionForm({
  action,
  successMessage,
  locale,
  redirectTo,
  onSuccess,
  className,
  id,
  children,
}: ActionFormProps) {
  const router = useRouter();
  const currentLocale = useLocale();
  const t = useTranslations("common");
  const resolvedLocale: ActionLocale =
    locale ?? (currentLocale === "fr" ? "fr" : "ar");
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (!result) {
          router.refresh();
          return;
        }
        if (result.ok) {
          toast.success(
            result.message || successMessage || t("actionSuccess")
          );
          onSuccess?.();
          const target = result.redirect || redirectTo;
          if (target) router.push(target);
          else router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(toFriendlyActionError(message, resolvedLocale));
      }
    });
  }

  return (
    <form
      id={id}
      action={handleAction}
      className={cn(className, pending && "pointer-events-none opacity-80")}
    >
      {children}
    </form>
  );
}
