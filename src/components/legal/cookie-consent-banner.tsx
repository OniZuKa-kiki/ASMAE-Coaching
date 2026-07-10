"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const CONSENT_KEY = "asmae-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = (level: "essential" | "all") => {
    localStorage.setItem(CONSENT_KEY, level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[150] border-t border-border/60 bg-card/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-6"
      role="dialog"
      aria-label="موافقة ملفات الارتباط"
    >
      <div className="container-wide mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 pe-2">
          <p className="mb-1 font-semibold text-heading">ملفات الارتباط</p>
          <p className="text-sm leading-relaxed text-text/80">
            نستخدم ملفات ارتباط تقنية ضرورية لتشغيل الموقع والدفع. يمكنكِ
            قبول الكل أو الضرورية فقط.{" "}
            <Link href="/politique-cookies" className="text-primary hover:underline">
              سياسة ملفات الارتباط
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => accept("essential")}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
          >
            الضرورية فقط
          </button>
          <button
            type="button"
            onClick={() => accept("all")}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            قبول الكل
          </button>
          <button
            type="button"
            onClick={() => accept("essential")}
            className="rounded-lg p-2 text-text/50 transition-colors hover:text-heading"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
