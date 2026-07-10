import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { confidentialiteContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: confidentialiteContent.title,
  description: confidentialiteContent.description,
};

export default function ConfidentialitePage() {
  return <LegalDocument content={confidentialiteContent} />;
}
