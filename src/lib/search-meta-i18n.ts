import arMessages from "../../messages/ar.json";
import frMessages from "../../messages/fr.json";
import type { AppLocale } from "@/i18n/routing";

type SearchMetaCopy = typeof arMessages.search.meta;

export function getSearchMetaCopy(locale: AppLocale): SearchMetaCopy {
  return locale === "fr" ? frMessages.search.meta : arMessages.search.meta;
}
