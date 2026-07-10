"use client";

import { useEffect, useRef, useState } from "react";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { clerkAppearance } from "@/lib/clerk-appearance";

type AuthSignInPanelProps = {
  redirectUrl: string;
  /** false quand le serveur a rendu /sign-in sans session valide */
  serverHasSession: boolean;
};

type Phase = "checking" | "repairing" | "form";

/**
 * Si le client Clerk croit être connecté alors que le serveur n'a pas de session,
 * on purge la session fantôme (signOut) au lieu de rediriger — sinon boucle sign-in ↔ dashboard.
 * Pas de forceRedirectUrl : évite la redirection auto quand le serveur rejette la session.
 */
export function AuthSignInPanel({
  redirectUrl,
  serverHasSession,
}: AuthSignInPanelProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [phase, setPhase] = useState<Phase>("checking");
  const repairedRef = useRef(false);

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
        runId: "post-fix-v2",
        hypothesisId: "D",
        location: "auth-sign-in-panel.tsx:effect",
        message: "sign-in panel client state",
        data: {
          isLoaded,
          isSignedIn,
          serverHasSession,
          redirectUrl,
          phase,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!isSignedIn || serverHasSession) {
      setPhase("form");
      return;
    }

    if (repairedRef.current) return;
    repairedRef.current = true;
    setPhase("repairing");

    let cancelled = false;

    void signOut()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setPhase("form");
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, serverHasSession, signOut, redirectUrl]);

  if (phase !== "form") {
    return (
      <div className="flex min-h-[320px] w-full max-w-[28rem] flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-label="جارٍ التحميل"
        />
        <p className="text-sm text-text/70">
          {phase === "repairing"
            ? "جارٍ مزامنة جلسة الدخول..."
            : "جارٍ التحميل..."}
        </p>
      </div>
    );
  }

  return (
    <SignIn
      key={isSignedIn ? "signed-in" : "signed-out"}
      appearance={clerkAppearance}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
