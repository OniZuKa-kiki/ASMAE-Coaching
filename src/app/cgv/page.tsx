import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDocument, getLegalLastUpdatedLabel } from "@/lib/legal-i18n";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cgv");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/cgv"),
  };
}

export default async function CgvPage() {
  const [content, lastUpdatedLabel] = await Promise.all([
    getLegalDocument("cgv"),
    getLegalLastUpdatedLabel(),
  ]);

  return <LegalDocument content={content} lastUpdatedLabel={lastUpdatedLabel} />;
}
