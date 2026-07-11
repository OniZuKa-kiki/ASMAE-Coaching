"use client";

import { useEffect, useRef, useState } from "react";
import { SignUp, useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { clerkAppearance } from "@/lib/clerk-appearance";

type AuthSignUpPanelProps = {
  redirectUrl: string;
  serverHasSession: boolean;
};

type Phase = "checking" | "repairing" | "form";

export function AuthSignUpPanel({
  redirectUrl,
  serverHasSession,
}: AuthSignUpPanelProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const t = useTranslations("auth");
  const [phase, setPhase] = useState<Phase>("checking");
  const repairedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

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
  }, [isLoaded, isSignedIn, serverHasSession, signOut]);

  if (phase !== "form") {
    return (
      <div className="flex min-h-[320px] w-full max-w-[28rem] flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-label={t("loadingAria")}
        />
        <p className="text-sm text-text/70">
          {phase === "repairing" ? t("repairingSession") : t("loading")}
        </p>
      </div>
    );
  }

  return (
    <SignUp
      key={isSignedIn ? "signed-in" : "signed-out"}
      appearance={clerkAppearance}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
