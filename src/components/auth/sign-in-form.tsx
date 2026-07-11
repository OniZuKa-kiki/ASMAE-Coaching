"use client";

import { useEffect, useRef, useState } from "react";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { SignInSkeleton } from "@/components/auth/sign-in-skeleton";

const REDIRECT_KEY = "clerk-sign-in-redirect";

type SignInFormProps = {
  redirectUrl: string;
};

/**
 * Formulaire Clerk + gestion de la désync client/serveur sans boucle infinie :
 * une seule tentative de redirection, puis choix manuel pour l'utilisatrice.
 */
export function SignInForm({ redirectUrl }: SignInFormProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const t = useTranslations("auth");
  const [needsHelp, setNeedsHelp] = useState(false);
  const triedRedirectRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      sessionStorage.removeItem(REDIRECT_KEY);
      setNeedsHelp(false);
      triedRedirectRef.current = false;
      return;
    }

    if (triedRedirectRef.current) return;

    const attempts = Number(sessionStorage.getItem(REDIRECT_KEY) || "0");
    if (attempts >= 1) {
      setNeedsHelp(true);
      return;
    }

    triedRedirectRef.current = true;
    sessionStorage.setItem(REDIRECT_KEY, "1");
    window.location.assign(redirectUrl);
  }, [isLoaded, isSignedIn, redirectUrl]);

  if (!isLoaded) {
    return <SignInSkeleton />;
  }

  if (isSignedIn) {
    if (needsHelp) {
      return (
        <div className="w-full space-y-4 rounded-[20px] border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-text/80">{t("sessionOutOfSync")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <a
              href={redirectUrl}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {t("continueToAccount")}
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-text/70">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <SignIn
      appearance={clerkAppearance}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
