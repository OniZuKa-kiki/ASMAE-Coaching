"use client";

import { useEffect, useRef, useState } from "react";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
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
  const [needsHelp, setNeedsHelp] = useState(false);
  const triedRedirectRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // #region agent log
    fetch("http://127.0.0.1:7895/ingest/5e4aacde-27c2-423a-9369-075d50ed4102", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2892fb",
      },
      body: JSON.stringify({
        sessionId: "2892fb",
        hypothesisId: "C",
        location: "sign-in-form.tsx:effect",
        message: "client auth state",
        data: {
          isSignedIn,
          redirectUrl,
          attempts: sessionStorage.getItem(REDIRECT_KEY),
          needsHelp,
          cookieNames: document.cookie
            .split(";")
            .map((c) => c.trim().split("=")[0])
            .filter((n) => n.startsWith("__client") || n.startsWith("__session")),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
          <p className="text-sm text-text/80">
            جلسة الدخول غير متزامنة. يمكنكِ متابعة الصفحة المطلوبة أو تسجيل
            الخروج ثم الدخول مجددًا.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <a
              href={redirectUrl}
              onClick={() => {
                // #region agent log
                fetch(
                  "http://127.0.0.1:7895/ingest/5e4aacde-27c2-423a-9369-075d50ed4102",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Debug-Session-Id": "2892fb",
                    },
                    body: JSON.stringify({
                      sessionId: "2892fb",
                      hypothesisId: "C",
                      location: "sign-in-form.tsx:continue-click",
                      message: "user clicked continue to account",
                      data: { redirectUrl, isSignedIn },
                      timestamp: Date.now(),
                    }),
                  }
                ).catch(() => {});
                // #endregion
              }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              متابعة إلى حسابي
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-text/70">جارٍ التحويل...</p>
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
