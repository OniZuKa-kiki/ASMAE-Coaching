import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { services } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "الخدمة غير موجودة" };
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <p className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4">
          التدريب
        </p>
        <h1 className="page-title mb-6">
          {service.title}
        </h1>
        <p className="text-xl text-text/80 mb-8">{service.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-10 p-4 sm:p-6 rounded-[20px] bg-card border border-border/50">
          <div className="flex items-center gap-2 text-text">
            <Clock className="w-5 h-5 text-primary" />
            <span>{service.duration}</span>
          </div>
          <div className="font-heading text-3xl font-semibold text-primary">
            {formatPrice(service.price)}
          </div>
        </div>

        <h2 className="font-heading text-2xl font-semibold text-heading mb-4">
          النتائج المتوقعة
        </h2>
        <ul className="space-y-3 mb-10">
          {service.results.map((result) => (
            <li key={result} className="flex items-start gap-3 text-text">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              {result}
            </li>
          ))}
        </ul>

        <ButtonLink href={`/booking?service=${service.slug}`} size="lg">
          حجز جلسة
        </ButtonLink>
      </div>
    </section>
  );
}
