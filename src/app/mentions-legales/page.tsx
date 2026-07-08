import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الإشعار القانوني",
};

export default function MentionsLegalesPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl prose prose-lg">
        <h1 className="font-heading text-4xl font-semibold text-heading mb-8">
          الإشعار القانوني
        </h1>
        <p className="text-text">
          يُدار هذا الموقع بواسطة ASMAE Coaching. ستُضاف المعلومات القانونية
          الكاملة (الناشر، مزود الاستضافة، السجل التجاري) قبل الإطلاق الرسمي.
        </p>
      </div>
    </section>
  );
}
