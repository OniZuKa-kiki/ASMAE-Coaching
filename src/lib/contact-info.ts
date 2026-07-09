import { siteConfig } from "@/lib/constants";

export type PublicContact = {
  email: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  instagramHandle: string | null;
};

export function getDefaultContact(): PublicContact {
  return {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    instagram: siteConfig.contact.instagram,
    instagramHandle: "asmae_coaching",
  };
}
