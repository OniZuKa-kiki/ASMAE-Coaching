import { useEffect } from "react";

function restoreScrollPosition(scrollY: number) {
  const html = document.documentElement;
  const body = document.body;
  const prevScrollBehavior = html.style.scrollBehavior;

  // globals.css définit scroll-behavior: smooth — sans ça, la page
  // repart du haut puis défile visuellement jusqu'à l'ancienne position.
  html.style.scrollBehavior = "auto";
  html.scrollTop = scrollY;
  body.scrollTop = scrollY;
  html.style.scrollBehavior = prevScrollBehavior;
}

/** Bloque le scroll de la page (iOS-safe) quand un panneau mobile est ouvert. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;

      restoreScrollPosition(scrollY);

      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, [active]);
}
