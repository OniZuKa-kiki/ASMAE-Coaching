import Link from "next/link";
import { Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { footerBrowseLinks, siteConfig } from "@/lib/constants";
import { legalFooterLinks } from "@/lib/legal-content";
import { Logo } from "@/components/layout/logo";
import {
  getDefaultContact,
  type PublicContact,
} from "@/lib/contact-info";

type FooterProps = {
  contact?: PublicContact;
};

export function Footer({ contact = getDefaultContact() }: FooterProps) {
  return (
    <footer className="bg-heading text-white/90 mt-auto">
      <div className="container-wide px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-6 sm:gap-6 lg:grid-cols-3 lg:gap-10">
          <div className="col-span-2 flex flex-col items-center gap-3 text-center sm:items-start sm:text-start lg:col-span-1 lg:max-w-[240px]">
            <Logo size="footer" className="block" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">التصفح</h4>
            <ul className="space-y-1.5">
              {footerBrowseLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">تواصل</h4>
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
                    واتساب
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
                    إنستغرام
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/50 text-center sm:text-start">
            © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-white/50 sm:justify-end">
            {legalFooterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
