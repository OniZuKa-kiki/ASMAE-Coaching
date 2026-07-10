import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { cgvContent } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: cgvContent.title,
  description: cgvContent.description,
};

export default function CgvPage() {
  return <LegalDocument content={cgvContent} />;
}
