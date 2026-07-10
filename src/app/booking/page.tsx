import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { bookingPageContent } from "@/lib/constants";
import { getActiveServices } from "@/lib/services";

export default async function BookingPage() {
  const services = await getActiveServices();

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center mb-8">
          <h1 className="page-title mb-4">{bookingPageContent.title}</h1>
          <p className="text-xl text-text/80">{bookingPageContent.subtitle}</p>
        </div>
      </section>
      <section className="section-padding !pt-0">
        <Suspense fallback={<div className="text-center">جارٍ التحميل...</div>}>
          <BookingForm services={services} />
        </Suspense>
      </section>
    </>
  );
}
