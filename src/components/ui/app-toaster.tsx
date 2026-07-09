"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

const PANEL_ROUTES = ["/dashboard", "/admin"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function hasPublicHeader(pathname: string) {
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) return false;
  if (PANEL_ROUTES.some((route) => pathname.startsWith(route))) return false;
  return true;
}

function hasPanelMobileHeader(pathname: string) {
  return PANEL_ROUTES.some((route) => pathname.startsWith(route));
}

function getTopOffset(pathname: string) {
  if (hasPublicHeader(pathname)) {
    if (typeof window === "undefined") return 72;
    if (window.matchMedia("(min-width: 1024px)").matches) return 104;
    if (window.matchMedia("(min-width: 640px)").matches) return 88;
    return 72;
  }

  if (hasPanelMobileHeader(pathname)) {
    if (typeof window === "undefined") return 60;
    return window.matchMedia("(max-width: 1023px)").matches ? 60 : 16;
  }

  return 16;
}

export function AppToaster() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [topOffset, setTopOffset] = useState(() => getTopOffset(pathname));

  useEffect(() => {
    const update = () => setTopOffset(getTopOffset(pathname));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pathname]);

  const position = useMemo(
    () => (isAdmin ? "top-right" : "top-left"),
    [isAdmin]
  );

  const sideOffset = 12;

  return (
    <Toaster
      position={position}
      richColors
      closeButton
      dir={isAdmin ? "ltr" : "rtl"}
      offset={{
        top: topOffset,
        ...(isAdmin ? { right: sideOffset } : { left: sideOffset }),
      }}
      mobileOffset={{
        top: topOffset,
        left: 10,
        right: 10,
      }}
      toastOptions={{
        classNames: {
          toast:
            "font-body shadow-lg w-full max-w-[min(100vw-1.25rem,22rem)] sm:max-w-sm",
        },
      }}
    />
  );
}
