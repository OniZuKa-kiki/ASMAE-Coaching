"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SignInSkeleton } from "@/components/auth/sign-in-skeleton";

type SignInRedirectProps = {
  redirectUrl: string;
  children: React.ReactNode;
};

/**
 * Si Clerk côté client est connecté mais que le serveur a rendu /sign-in,
 * on resynchronise via refresh + navigation (sans signOut ni boucle sessionStorage).
 */
export function SignInRedirect({ redirectUrl, children }: SignInRedirectProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || didRedirect.current) return;
    didRedirect.current = true;

    // #region agent log
    fetch("http://127.0.0.1:7895/ingest/5e4aacde-27c2-423a-9369-075d50ed4102", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2892fb",
      },
      body: JSON.stringify({
        sessionId: "2892fb",
        runId: "post-fix",
        hypothesisId: "FIX",
        location: "sign-in-redirect.tsx:effect",
        message: "client signed in on sign-in — refresh+replace",
        data: { redirectUrl, isSignedIn },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    router.refresh();
    router.replace(redirectUrl);
  }, [isLoaded, isSignedIn, redirectUrl, router]);

  if (!isLoaded) {
    return <SignInSkeleton />;
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-text/70">جارٍ التحويل...</p>
      </div>
    );
  }

  return children;
}
