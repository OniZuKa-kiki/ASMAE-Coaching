import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { ContactPageContent } from "@/components/contact/contact-page";
import { getPublicContact } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localeAlternates("/contact"),
  };
}

export default async function ContactPage() {
  const contact = await getPublicContact();
  return <ContactPageContent contact={contact} />;
}
