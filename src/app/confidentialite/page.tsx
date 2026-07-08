import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
};

export default function ConfidentialitePage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl prose prose-lg">
        <h1 className="font-heading text-4xl font-semibold text-heading mb-8">
          سياسة الخصوصية
        </h1>
        <p className="text-text">
          تُعالَج بياناتك الشخصية وفقاً للائحة العامة لحماية البيانات (RGPD).
          ستوضح هذه السياسة البيانات المجمّعة واستخدامها وحقوقك في الوصول
          والتصحيح والحذف.
        </p>
      </div>
    </section>
  );
}
