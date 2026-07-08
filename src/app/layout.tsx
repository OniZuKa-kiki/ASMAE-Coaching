import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import { SiteShell } from "@/components/layout/site-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";
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
    "كوتشينغ مخصص لمساعدتك على تجاوز عوائقك، استعادة توازنك، وتحقيق أهدافك.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <ClerkProvider appearance={clerkAppearance} localization={arSA}>
          <SiteShell>{children}</SiteShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
