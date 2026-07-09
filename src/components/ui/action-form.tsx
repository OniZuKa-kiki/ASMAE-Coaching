"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  className?: string;
  children: React.ReactNode;
};

export function ActionForm({
  action,
  successMessage,
  locale = "ar",
  redirectTo,
  className,
  children,
}: ActionFormProps) {
  const router = useRouter();
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
          toast.success(result.message || successMessage || actionMessagesFallback(locale));
          const target = result.redirect || redirectTo;
          if (target) router.push(target);
          else router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        toast.error(toFriendlyActionError(message, locale));
      }
    });
  }

  return (
    <form
      action={handleAction}
      className={cn(className, pending && "pointer-events-none opacity-80")}
    >
      {children}
    </form>
  );
}

function actionMessagesFallback(locale: ActionLocale) {
  return locale === "fr" ? "Action réussie" : "تم بنجاح";
}
