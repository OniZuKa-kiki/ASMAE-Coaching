export const siteConfig = {
  /** Nom de marque (logo, mentions légales). */
  name: "ASMAE",
  /** Libellé public — préférer les traductions `metadata.siteName` dans l'UI. */
  publicName: "Coaching de vie",
  tagline: "كوتشينغ",
  motto: "تجاوز • توازن • ازدهار",
  description:
    "مرافقة شخصية تساعدك على تجاوز التحديات، واستعادة توازنك، وتحقيق أهدافك بثقة ووضوح.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  contact: {
    email: "contact@asmae-coaching.fr",
    phone: "+33 6 00 00 00 00",
    whatsapp: "https://wa.me/33600000000",
    instagram: "https://instagram.com/asmae_coaching",
  },
};
