import Link from "next/link";
import { XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ from?: string; slug?: string }>;
};

export default async function BookingCancelPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const fromCourse = params.from === "course" && params.slug;

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <XCircle className="h-8 w-8 text-accent" />
        </div>
        <h1 className="page-header-title mb-4">تم إلغاء الدفع</h1>
        <p className="mb-2 text-text/80">لم تُخصَم أي مبالغ من حسابكِ.</p>
        <p className="mb-8 text-text/70">
          يمكنكِ إعادة المحاولة في أي وقت. إذا واجهتِ مشكلة تقنية، تواصلي معنا.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {fromCourse ? (
            <ButtonLink href={`/courses/${params.slug}`}>
              العودة إلى الدورة
            </ButtonLink>
          ) : (
            <ButtonLink href="/booking">إعادة الحجز</ButtonLink>
          )}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border-2 border-primary px-8 py-3.5 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            تواصل معنا
          </Link>
        </div>
        <p className="mt-8 text-sm text-text/60">
          بمتابعة الشراء، فإنكِ توافقين على{" "}
          <Link href="/cgv" className="text-primary hover:underline">
            شروط البيع
          </Link>{" "}
          و{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
