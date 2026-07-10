import "server-only";

import fs from "fs";
import path from "path";

const CAIRO_PKG = path.join(process.cwd(), "node_modules/@fontsource/cairo");
const WEIGHT_FILES = ["400.css", "600.css", "700.css"] as const;

let cachedFontCss: string | null = null;

function embedFontUrls(css: string): string {
  return css.replace(
    /src:\s*url\(\.\/files\/([^)]+\.woff2)\)\s*format\('woff2'\),\s*url\(\.\/files\/[^)]+\.woff\)\s*format\('woff'\);/g,
    (_match, filename: string) => {
      const fontPath = path.join(CAIRO_PKG, "files", filename);
      const base64 = fs.readFileSync(fontPath).toString("base64");
      return `src: url(data:font/woff2;base64,${base64}) format('woff2');`;
    }
  );
}

export function getEmbeddedCairoFontCss(): string {
  if (cachedFontCss) return cachedFontCss;

  const combined = WEIGHT_FILES.map((file) =>
    fs.readFileSync(path.join(CAIRO_PKG, file), "utf8")
  ).join("\n");

  cachedFontCss = embedFontUrls(combined);
  return cachedFontCss;
}
