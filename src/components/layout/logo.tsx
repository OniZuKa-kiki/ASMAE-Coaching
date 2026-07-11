"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const sizeClasses = {
  header: "max-h-[56px] sm:max-h-[72px] lg:max-h-[80px] w-auto min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]",
  footer: "max-h-[64px] sm:max-h-[76px] lg:max-h-[84px] w-auto max-w-[180px] sm:max-w-[200px]",
};

export function Logo({
  className,
  size = "header",
}: {
  className?: string;
  size?: "header" | "footer";
}) {
  const t = useTranslations("metadata");

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center shrink-0", className)}
      aria-label={t("logoLinkAria")}
    >
      <Image
        src="/logo.png"
        alt={t("logoImageAlt")}
        width={400}
        height={400}
        className={cn("h-auto object-contain", sizeClasses[size])}
        priority={size === "header"}
      />
    </Link>
  );
}
