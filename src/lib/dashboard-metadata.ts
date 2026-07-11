import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";

export async function dashboardPageMetadata({
  path,
  namespace,
  titleKey,
  descriptionKey,
}: {
  path: string;
  namespace: string;
  titleKey: string;
  descriptionKey?: string;
}): Promise<Metadata> {
  const t = await getTranslations(namespace);
  return {
    title: t(titleKey),
    ...(descriptionKey ? { description: t(descriptionKey) } : {}),
    alternates: localeAlternates(path),
  };
}
