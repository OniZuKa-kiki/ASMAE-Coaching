import type { Metadata } from "next";
import { ContactPageContent } from "@/components/contact/contact-page";
import { contactPageContent } from "@/lib/constants";
import { getPublicContact } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: contactPageContent.title,
  description: contactPageContent.subtitle,
};

export default async function ContactPage() {
  const contact = await getPublicContact();
  return <ContactPageContent contact={contact} />;
}
