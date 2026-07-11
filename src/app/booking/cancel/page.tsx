import Link from "next/link";
import { XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ from?: string; slug?: string }>;
};

export default async function BookingCancelPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const fromCourse = params.from === "course" && params.slug;
  const t = await getTranslations("booking.cancel");

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <XCircle className="h-8 w-8 text-accent" />
        </div>
        <h1 className="page-header-title mb-4">{t("title")}</h1>
        <p className="mb-2 text-text/80">{t("noCharge")}</p>
        <p className="mb-8 text-text/70">{t("retryHint")}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {fromCourse ? (
            <ButtonLink href={`/courses/${params.slug}`}>
              {t("backToCourse")}
            </ButtonLink>
          ) : (
            <ButtonLink href="/booking">{t("retryBooking")}</ButtonLink>
          )}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border-2 border-primary px-8 py-3.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            {t("contactUs")}
          </Link>
        </div>
        <p className="mt-8 text-sm text-text/60">
          {t("legalPrefix")}{" "}
          <Link href="/cgv" className="text-primary hover:underline">
            {t("cgv")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">
            {t("privacy")}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
