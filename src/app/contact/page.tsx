"use client";

import { useState } from "react";
import { Mail, MessageCircle, Share2, Send } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Input, Textarea } from "@/components/ui/input";
import { siteConfig } from "@/lib/constants";
import { friendlyErrors } from "@/lib/api-errors";
import { notifyError, notifySuccess } from "@/lib/notify";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الإرسال");

      setSubmitted(true);
      notifySuccess(friendlyErrors.contactSuccess);
      form.reset();
    } catch (err) {
      notifyError(err, "خطأ في الإرسال");
      setError(err instanceof Error ? err.message : "خطأ في الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">
            تواصل معنا
          </h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            لديك سؤال؟ ترغب في معرفة المزيد؟ أنا هنا للإجابة عليك.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading
                title="لنبقَ على تواصل"
                subtitle="اختر الوسيلة التي تناسبك"
                centered={false}
                className="mb-8"
              />
              <div className="space-y-4">
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading">البريد الإلكتروني</p>
                    <p className="text-sm text-text/70">{siteConfig.contact.email}</p>
                  </div>
                </a>
                <a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading">واتساب</p>
                    <p className="text-sm text-text/70">رد سريع</p>
                  </div>
                </a>
                <a
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-heading">إنستغرام</p>
                    <p className="text-sm text-text/70">@asmae_coaching</p>
                  </div>
                </a>
              </div>
            </div>

            <Card>
              {submitted ? (
                <div className="text-center py-8">
                  <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-semibold text-heading mb-2">
                    تم إرسال الرسالة!
                  </h3>
                  <p className="text-text/70">
                    سأرد عليك في أقرب وقت ممكن.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading text-2xl font-semibold text-heading mb-6">
                    أرسل لي رسالة
                  </h3>
                  <div>
                    <Label htmlFor="name">الاسم</Label>
                    <Input id="name" name="name" placeholder="اسمك" required />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" name="email" type="email" placeholder="votre@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea id="message" name="message" placeholder="رسالتك..." required />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "جارٍ الإرسال..." : "إرسال"}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
