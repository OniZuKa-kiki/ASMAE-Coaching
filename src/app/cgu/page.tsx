import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { cguContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: cguContent.title,
  description: cguContent.description,
};

export default function CguPage() {
  return <LegalDocument content={cguContent} />;
}
