"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { legalFooterHrefs } from "@/lib/legal-content";
import { Logo } from "@/components/layout/logo";
import {
  getDefaultContact,
  type PublicContact,
} from "@/lib/contact-info";

const footerNav = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "coaching", href: "/services" },
  { key: "bookSession", href: "/booking" },
  { key: "podcasts", href: "/podcasts" },
  { key: "courses", href: "/courses" },
  { key: "blog", href: "/blog" },
  { key: "testimonials", href: "/testimonials" },
] as const;

type FooterProps = {
  contact?: PublicContact;
};

export function Footer({ contact = getDefaultContact() }: FooterProps) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const tm = useTranslations("metadata");
  const tl = useTranslations("legal.footer");

  return (
    <footer className="bg-heading text-white/90 mt-auto">
      <div className="container-wide px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-start lg:max-w-[240px]">
            <Logo size="footer" className="block" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
              {tm("description")}
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">
              {tf("browse")}
            </h4>
            <ul className="space-y-1.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">
              {tf("contact")}
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                >
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{contact.email}</span>
                </a>
              </li>
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    <Phone size={14} className="shrink-0" />
                    <span>{contact.phone}</span>
                  </a>
                </li>
              )}
              {contact.whatsapp && (
                <li>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    <MessageCircle size={14} className="shrink-0" />
                    {tf("whatsapp")}
                  </a>
                </li>
              )}
              {contact.instagram && (
                <li>
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    <Share2 size={14} className="shrink-0" />
                    {tf("instagram")}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/50 text-center sm:text-start">
            © {new Date().getFullYear()} {tm("siteName")}. {tf("rights")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-white/50 sm:justify-end">
            {legalFooterHrefs.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-accent transition-colors"
              >
                {tl(link.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
