"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminTwoFactorGate() {
  const t = useTranslations("admin.twoFactor");

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-[20px] border border-amber-200 bg-amber-50 p-8 text-center">
        <Shield className="w-12 h-12 text-amber-700 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-semibold text-heading mb-3">
          {t("title")}
        </h1>
        <p className="text-text/80 text-sm leading-relaxed mb-6">{t("body")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
          >
            {t("backToDashboard")}
          </Link>
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {t("setup")}
          </a>
        </div>
      </div>
    </div>
  );
}
