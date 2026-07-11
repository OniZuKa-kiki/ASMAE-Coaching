import { getTranslations } from "next-intl/server";
import type { LegalDocumentContent, LegalSection } from "@/lib/legal-content";

export const legalPageKeys = [
  "mentionsLegales",
  "confidentialite",
  "cgu",
  "cgv",
  "cookies",
] as const;

export type LegalPageKey = (typeof legalPageKeys)[number];

export const legalPagePaths: Record<LegalPageKey, string> = {
  mentionsLegales: "/mentions-legales",
  confidentialite: "/confidentialite",
  cgu: "/cgu",
  cgv: "/cgv",
  cookies: "/politique-cookies",
};

export async function getLegalDocument(
  key: LegalPageKey
): Promise<LegalDocumentContent> {
  const t = await getTranslations(`legal.${key}`);
  const sections = t.raw("sections") as LegalSection[];

  return {
    title: t("title"),
    description: t("metaDescription"),
    intro: t("intro"),
    sections: sections.map((section) => ({
      title: section.title,
      paragraphs: section.paragraphs ?? [],
      list: section.list,
    })),
    lastUpdated: t("lastUpdated"),
  };
}

export async function getLegalLastUpdatedLabel(): Promise<string> {
  const t = await getTranslations("legal");
  return t("lastUpdatedLabel");
}
