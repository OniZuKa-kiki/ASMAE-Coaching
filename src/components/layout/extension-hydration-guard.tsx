import Script from "next/script";

/**
 * Certaines extensions (ex. Bitdefender) injectent bis_skin_checked sur les divs
 * avant l'hydratation React, ce qui provoque des avertissements en développement.
 */
export function ExtensionHydrationGuard() {
  return (
    <Script id="extension-hydration-guard" strategy="beforeInteractive">
      {`(function(){function strip(){try{document.querySelectorAll("[bis_skin_checked]").forEach(function(el){el.removeAttribute("bis_skin_checked");});}catch(e){}}strip();if(typeof MutationObserver!=="undefined"){new MutationObserver(strip).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["bis_skin_checked"]});}})();`}
    </Script>
  );
}
