"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { navigation, primaryNavigation } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { NavMoreMenu } from "@/components/layout/nav-more-menu";
import { ButtonLink } from "@/components/ui/button";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container-wide px-4 sm:px-6 lg:px-8 h-16 sm:h-20 lg:h-24">
          {/* Mobile: menu à droite (RTL), logo centré */}
          <div className="xl:hidden grid grid-cols-[2.5rem_1fr_2.5rem] items-center h-full">
            <button
              className="p-2 -me-2 text-heading rounded-lg hover:bg-primary/5 transition-colors justify-self-start"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={mobileOpen}
            >
              <Menu size={24} />
            </button>
            <Logo size="header" className="justify-self-center scale-[0.9] sm:scale-100" />
            <div aria-hidden className="w-10" />
          </div>

          {/* Desktop */}
          <div className="hidden xl:flex items-center justify-between gap-4 h-full">
            <Logo size="header" />

            <nav className="flex items-center gap-6">
              {primaryNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-text hover:text-primary transition-colors duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
              <NavMoreMenu />
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 text-sm font-medium text-text hover:text-primary transition-colors px-2">
                    <User className="w-4 h-4" />
                    حسابي
                  </button>
                </SignInButton>
                <ButtonLink href="/booking" size="sm">
                  احجز
                </ButtonLink>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-text hover:text-primary transition-colors whitespace-nowrap"
                >
                  مساحتي
                </Link>
                <UserButton />
              </Show>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="site-mobile-menu"
            className="xl:hidden fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-heading/40"
              onClick={() => setMobileOpen(false)}
              aria-label="إغلاق القائمة"
            />

            <motion.aside
              className="absolute top-0 inset-inline-start-0 h-full w-[min(100vw-3rem,20rem)] bg-card border-inline-end border-border/50 shadow-soft flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50">
                <p className="font-heading text-lg font-semibold text-heading">القائمة</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-heading hover:bg-primary/5 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-2.5 px-3 text-text hover:text-primary hover:bg-primary/5 rounded-xl transition-colors text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-3 mt-2 border-t border-border/50 flex flex-col gap-2">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="py-2.5 px-3 text-start text-text hover:text-primary flex items-center gap-2 w-full rounded-xl hover:bg-primary/5 transition-colors text-sm">
                        <User className="w-4 h-4" />
                        تسجيل الدخول / إنشاء حساب
                      </button>
                    </SignInButton>
                    <ButtonLink href="/booking" className="text-center" size="sm">
                      احجز
                    </ButtonLink>
                  </Show>
                  <Show when="signed-in">
                    <Link
                      href="/dashboard"
                      className="py-2.5 px-3 text-text hover:text-primary rounded-xl hover:bg-primary/5 transition-colors text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      مساحتي
                    </Link>
                    <div className="px-3 py-1">
                      <UserButton />
                    </div>
                  </Show>
                </div>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
