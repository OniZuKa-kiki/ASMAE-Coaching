import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA, frFR } from "@clerk/localizations";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SiteShell } from "@/components/layout/site-shell";
import { AppToaster } from "@/components/ui/app-toaster";
import { ExtensionHydrationGuard } from "@/components/layout/extension-hydration-guard";
import { LocaleSettingsProvider } from "@/components/layout/locale-settings-provider";
import { LocaleCookieSync } from "@/components/layout/locale-cookie-sync";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getEnabledLocales } from "@/lib/locale-settings";
import { getPublicContact } from "@/lib/site-settings";
import { localeAlternates, openGraphLocale } from "@/lib/seo";
import type { AppLocale } from "@/i18n/routing";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([
    getLocale() as Promise<AppLocale>,
    getTranslations("metadata"),
  ]);
  const keywords = t.raw("keywords") as string[];

  return {
    title: {
      default: t("siteTitle"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords,
    alternates: localeAlternates("/"),
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      siteName: t("siteName"),
      description: t("description"),
    },
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getPublicContact();
  const locale = await getLocale();
  const messages = await getMessages();
  const enabledLocales = await getEnabledLocales();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const clerkLocalization = locale === "fr" ? frFR : arSA;

  return (
    <html lang={locale} dir={dir} className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <ExtensionHydrationGuard />
        <NextIntlClientProvider messages={messages}>
          <LocaleSettingsProvider enabledLocales={enabledLocales}>
            <LocaleCookieSync enabledLocales={enabledLocales} />
            <NavigationProgress />
            <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
              <SiteShell contact={contact}>{children}</SiteShell>
              <AppToaster />
            </ClerkProvider>
          </LocaleSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
