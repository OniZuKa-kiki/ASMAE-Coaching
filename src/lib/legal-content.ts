export type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDocumentContent = {
  title: string;
  description: string;
  intro?: string;
  sections: LegalSection[];
  lastUpdated?: string;
};

export const legalFooterHrefs = [
  { href: "/mentions-legales", key: "mentionsLegales" },
  { href: "/cgu", key: "cgu" },
  { href: "/cgv", key: "cgv" },
  { href: "/confidentialite", key: "confidentialite" },
  { href: "/politique-cookies", key: "cookies" },
] as const;
