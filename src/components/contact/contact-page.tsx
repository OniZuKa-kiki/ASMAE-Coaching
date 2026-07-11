"use client";

import { useCallback, useState } from "react";
import { Mail, MessageCircle, Phone, Share2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/layout/page-hero";
import { ContentSection } from "@/components/layout/content-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Input, Textarea } from "@/components/ui/input";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import type { PublicContact } from "@/lib/contact-info";
import { getFriendlyErrors } from "@/lib/api-errors";
import type { AppLocale } from "@/i18n/routing";
import { notifyError, notifySuccess } from "@/lib/notify";
import { isTurnstileClientEnabled } from "@/lib/turnstile-client";

type ContactPageContentProps = {
  contact: PublicContact;
};

export function ContactPageContent({ contact }: ContactPageContentProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileActive = isTurnstileClientEnabled();

  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (turnstileActive && !turnstileToken) {
      const message = t("turnstileRequired");
      setError(message);
      notifyError(message, undefined, locale);
      setLoading(false);
      return;
    }

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
          turnstileToken: turnstileToken ?? undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("sendError"));

      setSubmitted(true);
      notifySuccess(getFriendlyErrors(locale).contactSuccess);
      form.reset();
    } catch (err) {
      notifyError(err, t("sendError"), locale);
      setError(err instanceof Error ? err.message : t("sendError"));
    } finally {
      setLoading(false);
    }
  };

  const instagramLabel = contact.instagramHandle
    ? `@${contact.instagramHandle.replace(/^@/, "")}`
    : t("instagram");

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />

      <ContentSection>
        <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                title={t("channelsTitle")}
                subtitle={t("channelsSubtitle")}
                centered={false}
                className="mb-8"
              />
              <div className="space-y-4">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors min-w-0"
                >
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-heading">{t("email")}</p>
                    <p className="text-sm text-text/70 break-all">{contact.email}</p>
                  </div>
                </a>

                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors min-w-0"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-heading">{t("phone")}</p>
                      <p className="text-sm text-text/70">{contact.phone}</p>
                    </div>
                  </a>
                )}

                {contact.whatsapp && (
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors min-w-0"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-heading">{t("whatsapp")}</p>
                      <p className="text-sm text-text/70">{t("whatsappHint")}</p>
                    </div>
                  </a>
                )}

                {contact.instagram && (
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors min-w-0"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-heading">{t("instagram")}</p>
                      <p className="text-sm text-text/70 break-all">{instagramLabel}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <Card>
              {submitted ? (
                <div className="text-center py-8">
                  <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-semibold text-heading mb-2">
                    {t("successTitle")}
                  </h3>
                  <p className="text-text/70">{t("successMessage")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-heading text-2xl font-semibold text-heading mb-6">
                    {t("formTitle")}
                  </h3>
                  <div>
                    <Label htmlFor="name">{t("nameLabel")}</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("emailLabel")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">{t("messageLabel")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t("messagePlaceholder")}
                      required
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {turnstileActive && (
                    <div className="flex justify-center pt-1">
                      <TurnstileWidget
                        key={locale}
                        onToken={handleTurnstileToken}
                        action="contact"
                        appearance="always"
                        theme="light"
                        size="normal"
                        language={locale === "fr" ? "fr" : "ar"}
                        className="mx-auto"
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("submitting") : t("submit")}
                  </Button>
                </form>
              )}
            </Card>
        </div>
      </ContentSection>
    </>
  );
}
