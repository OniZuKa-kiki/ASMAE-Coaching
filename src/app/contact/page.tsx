import { ContactPageContent } from "@/components/contact/contact-page";
import { getPublicContact } from "@/lib/site-settings";

export default async function ContactPage() {
  const contact = await getPublicContact();
  return <ContactPageContent contact={contact} />;
}
