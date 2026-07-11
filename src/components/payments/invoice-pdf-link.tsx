"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

type InvoicePdfLinkProps = {
  href: string;
  label: string;
  className?: string;
  variant?: "primary" | "outline";
};

export function InvoicePdfLink({
  href,
  label,
  className,
  variant = "outline",
}: InvoicePdfLinkProps) {
  const tCommon = useTranslations("common");
  const tPayments = useTranslations("dashboard.payments");
  const [loading, setLoading] = useState(false);

  async function handleDownload(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(href, { credentials: "include" });

      if (!response.ok) {
        let message = tPayments("downloadFailed");
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // ignore JSON parse errors
        }
        window.alert(message);
        return;
      }

      const blob = await response.blob();
      const filename =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? "invoice.pdf";

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert(tPayments("downloadFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <a
      href={href}
      onClick={handleDownload}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        variant === "primary"
          ? "bg-primary text-white hover:bg-primary-hover"
          : "border border-border text-heading hover:border-primary hover:text-primary",
        loading && "pointer-events-none opacity-70",
        className
      )}
    >
      <Download className="h-4 w-4 shrink-0" />
      {loading ? tCommon("loading") : label}
    </a>
  );
}
