import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { cookiesContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: cookiesContent.title,
  description: cookiesContent.description,
};

export default function PolitiqueCookiesPage() {
  return <LegalDocument content={cookiesContent} />;
}
