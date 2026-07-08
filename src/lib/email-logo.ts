import { readFileSync } from "fs";
import path from "path";

/** Identifiant pour l'image inline — référencé dans le HTML via cid:asmae-logo */
export const EMAIL_LOGO_CID = "asmae-logo";

let cachedLogoBase64: string | null = null;

function getLogoBase64(): string {
  if (!cachedLogoBase64) {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    cachedLogoBase64 = readFileSync(logoPath).toString("base64");
  }
  return cachedLogoBase64;
}

/** Pièce jointe inline Resend — le logo est intégré dans l'email, pas via URL */
export function getEmailLogoAttachment() {
  return {
    filename: "logo.png",
    content: getLogoBase64(),
    contentId: EMAIL_LOGO_CID,
  };
}

export function getEmailLogoSrc(): string {
  return `cid:${EMAIL_LOGO_CID}`;
}
