import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";

export default async function BookingSuccessPage() {
  const t = await getTranslations("booking.success");

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="page-header-title mb-4">{t("title")}</h1>
        <p className="text-text/80 mb-2">{t("pending")}</p>
        <p className="text-text/70 mb-8">{t("emailHint")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonLink href="/dashboard/bookings">{t("viewBookings")}</ButtonLink>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
