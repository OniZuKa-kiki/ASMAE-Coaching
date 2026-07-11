"use client";

import { createContext, useContext } from "react";
import type { AppLocale } from "@/i18n/routing";

const LocaleSettingsContext = createContext<AppLocale[]>(["ar"]);

export function LocaleSettingsProvider({
  enabledLocales,
  children,
}: {
  enabledLocales: AppLocale[];
  children: React.ReactNode;
}) {
  return (
    <LocaleSettingsContext.Provider value={enabledLocales}>
      {children}
    </LocaleSettingsContext.Provider>
  );
}

export function useEnabledLocales(): AppLocale[] {
  return useContext(LocaleSettingsContext);
}
