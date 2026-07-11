import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type ServiceHighlights = Record<string, string[]>;

export async function getServiceHighlights(
  locale: AppLocale
): Promise<ServiceHighlights> {
  const t = await getTranslations({ locale, namespace: "services.highlights" });
  const slugs = ["individuel", "couple", "carriere", "bien-etre"] as const;

  return Object.fromEntries(
    slugs.map((slug) => [slug, t.raw(slug) as string[]])
  );
}

export async function formatServiceDurationLabel(
  minutes: number,
  locale: AppLocale
): Promise<string> {
  const t = await getTranslations({ locale, namespace: "common" });
  return `${minutes} ${t("minutes")}`;
}
