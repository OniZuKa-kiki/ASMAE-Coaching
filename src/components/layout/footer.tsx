import Link from "next/link";
import { Mail, MessageCircle, Share2 } from "lucide-react";
import { navigation, siteConfig } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

const resourceLinks = [
  { href: "/blog", label: "المدونة" },
  { href: "/podcasts", label: "بودكاست" },
  { href: "/courses", label: "الدورات" },
  { href: "/testimonials", label: "شهادات" },
];

export function Footer() {
  return (
    <footer className="bg-heading text-white/90 mt-auto">
      <div className="container-wide px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-6 sm:gap-6 lg:grid-cols-4 lg:gap-10">
          <div className="col-span-2 flex flex-col items-center gap-3 text-center sm:items-start sm:text-start lg:col-span-1 lg:max-w-[240px]">
            <Logo size="footer" className="block" />
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">التنقل</h4>
            <ul className="space-y-1.5">
              {navigation.slice(0, 6).map((item) => (
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

          <div>
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">الموارد</h4>
            <ul className="space-y-1.5">
              {resourceLinks.map((item) => (
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

          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <h4 className="font-body font-semibold text-white text-sm mb-2 sm:mb-3">تواصل</h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                >
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{siteConfig.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                >
                  <MessageCircle size={14} className="shrink-0" />
                  واتساب
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-accent transition-colors"
                >
                  <Share2 size={14} className="shrink-0" />
                  إنستغرام
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm text-white/50 text-center sm:text-start">
            © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4 text-xs sm:text-sm text-white/50">
            <Link href="/mentions-legales" className="hover:text-accent transition-colors">
              الإشعارات القانونية
            </Link>
            <Link href="/confidentialite" className="hover:text-accent transition-colors">
              الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
