import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function BookingSuccessPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="page-header-title mb-4">
          تم الدفع بنجاح!
        </h1>
        <p className="text-text/80 mb-2">حجزكِ قيد التأكيد.</p>
        <p className="text-text/70 mb-8">
          ستتلقين بريدًا إلكترونيًا يتضمن تفاصيل جلستكِ ورابط الجلسة عبر الفيديو
          خلال لحظات.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ButtonLink href="/dashboard/bookings">عرض جلساتي</ButtonLink>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
