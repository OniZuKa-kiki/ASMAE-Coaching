"use client";

import { useEffect } from "react";

/**
 * Cookie Clerk corrompu (__client_uat=0) → boucles de redirection.
 * @see https://github.com/clerk/javascript/issues/1436
 */
export function ClerkSessionRepair() {
  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const uat = cookies.find((c) => c.startsWith("__client_uat="));
    if (!uat?.endsWith("=0")) return;

    for (const cookie of cookies) {
      const name = cookie.split("=")[0];
      if (!name.startsWith("__client") && !name.startsWith("__session")) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }

    sessionStorage.removeItem("clerk-sign-in-bounce");
    sessionStorage.removeItem("clerk-sign-up-bounce");
    window.location.reload();
  }, []);

  return null;
}
