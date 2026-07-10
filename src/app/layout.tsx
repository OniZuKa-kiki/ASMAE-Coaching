import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { SiteShell } from "@/components/layout/site-shell";
import { AppToaster } from "@/components/ui/app-toaster";
import { ExtensionHydrationGuard } from "@/components/layout/extension-hydration-guard";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getPublicContact } from "@/lib/site-settings";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ASMAE — كوتشينغ الحياة",
    template: "%s | ASMAE Coaching",
  },
  description:
    "مرافقة شخصية تساعدكِ على تجاوز التحديات، واستعادة توازنكِ، وتحقيق أهدافكِ بثقة ووضوح.",
  keywords: [
    "كوتشينغ الحياة",
    "التطوير الشخصي",
    "كوتش حياة",
    "الثقة بالنفس",
    "الرفاهية",
  ],
  openGraph: {
    type: "website",
    locale: "ar_MA",
    siteName: "ASMAE Coaching",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contact = await getPublicContact();

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <ExtensionHydrationGuard />
        <NavigationProgress />
        <ClerkProvider appearance={clerkAppearance} localization={arSA}>
          <SiteShell contact={contact}>{children}</SiteShell>
          <AppToaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
