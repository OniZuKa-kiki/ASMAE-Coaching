import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { mentionsLegalesContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: mentionsLegalesContent.title,
  description: mentionsLegalesContent.description,
};

export default function MentionsLegalesPage() {
  return <LegalDocument content={mentionsLegalesContent} />;
}
