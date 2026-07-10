"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Clock, ClipboardList, CreditCard, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { dateFnsLocale } from "@/lib/locale";
import { bookingPageContent } from "@/lib/constants";
import {
  BOOKING_REASON_IDS,
  type BookingReasonId,
  getBookingReasonLabel,
} from "@/lib/booking-reasons";
import { PaymentMethodSelector } from "@/components/payments/payment-method-selector";
import { getBookableDates } from "@/lib/booking-dates";
import { toFriendlyError, friendlyErrors } from "@/lib/api-errors";
import { notifyError, notifySuccess } from "@/lib/notify";
import {
  convertCatalogAmountToProvider,
  formatProviderAmount,
} from "@/lib/payments/currency";
import type {
  PaymentProviderConfig,
  PaymentProviderId,
} from "@/lib/payments/types";
import {
  formatServiceDuration,
  type BookableService,
} from "@/lib/services";

export function BookingForm({ services }: { services: BookableService[] }) {
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const preselectedService = searchParams.get("service");

  const defaultSlug =
    preselectedService && services.some((s) => s.slug === preselectedService)
      ? preselectedService
      : services[0]?.slug ?? "";

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(defaultSlug);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<BookingReasonId | null>(
    null
  );
  const [reasonDetail, setReasonDetail] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<PaymentProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProviderId>("payzone");

  const service = services.find((s) => s.slug === selectedService);

  const availableDates = getBookableDates(14);

  const canProceedStep3 =
    selectedReason !== null &&
    (selectedReason !== "other" || reasonDetail.trim().length >= 3);

  useEffect(() => {
    fetch("/api/payments/providers")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.providers || []) as PaymentProviderConfig[];
        setProviders(list);
        if (list.length > 0) setSelectedProvider(list[0].id);
      })
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(
      `/api/booking/availability?date=${selectedDate}&service=${selectedService}`
    )
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService]);

  async function handlePayment() {
    if (!selectedDate || !selectedTime || !service || !selectedReason) return;

    if (!isSignedIn) {
      const message = friendlyErrors.unauthorized;
      setError(message);
      notifyError(message);
      return;
    }

    setPaying(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: selectedService,
          date: selectedDate,
          startTime: selectedTime,
          provider: selectedProvider,
          bookingReason: selectedReason,
          bookingReasonDetail:
            selectedReason === "other" ? reasonDetail.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الدفع");

      if (data.url) {
        notifySuccess(friendlyErrors.bookingRedirect);
        window.location.href = data.url;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "خطأ في الدفع";
      setError(toFriendlyError(raw));
      notifyError(raw);
      setPaying(false);
    }
  }

  if (services.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-text/70">{bookingPageContent.noServices}</p>
      </Card>
    );
  }

  if (!service) return null;

  const payAmount = convertCatalogAmountToProvider(
    service.price,
    selectedProvider
  );
  const payLabel = formatProviderAmount(
    payAmount.amountCents,
    payAmount.currency
  );

  const steps = [
    { num: 1, label: bookingPageContent.steps.service, icon: Calendar },
    { num: 2, label: bookingPageContent.steps.schedule, icon: Clock },
    { num: 3, label: bookingPageContent.steps.intent, icon: ClipboardList },
    { num: 4, label: bookingPageContent.steps.payment, icon: CreditCard },
  ];

  return (
    <div className="container-narrow max-w-3xl">
      <div className="flex justify-between mb-8 sm:mb-12 gap-2">
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-200",
                step >= s.num
                  ? "bg-primary text-white"
                  : "bg-border/50 text-text/50",
                step === s.num && "ring-2 ring-primary/25"
              )}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs text-text text-center leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-heading text-2xl font-semibold text-heading mb-6">
              {bookingPageContent.chooseServiceTitle}
            </h2>
            {services.map((s) => (
              <Card
                key={s.slug}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedService === s.slug && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedService(s.slug)}
              >
                <h3 className="font-heading text-lg font-semibold text-heading">
                  {s.title}
                </h3>
                <p className="text-sm text-text/70">
                  {formatServiceDuration(s.durationMinutes)} —{" "}
                  {formatPrice(s.price)}
                </p>
              </Card>
            ))}
            <Button onClick={() => setStep(2)} className="w-full mt-6">
              {bookingPageContent.nextLabel}
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-heading text-2xl font-semibold text-heading mb-6">
              {bookingPageContent.chooseScheduleTitle}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
              {availableDates.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all text-sm",
                      selectedDate === dateStr
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="font-semibold">{date.getDate()}</div>
                    <div className="text-xs text-text/70">
                      {format(date, "MMM", { locale: dateFnsLocale })}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-text/70 text-center py-4 mb-6">
                    {bookingPageContent.noSlots}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                    {slots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 rounded-xl border text-center transition-all",
                          selectedTime === time
                            ? "border-primary bg-primary text-white"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                {bookingPageContent.backLabel}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                {bookingPageContent.nextLabel}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-heading text-2xl font-semibold text-heading">
                {bookingPageContent.intentTitle}
              </h2>
              <p className="mt-2 text-sm text-text/70">
                {bookingPageContent.intentSubtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {BOOKING_REASON_IDS.map((reasonId) => {
                const isSelected = selectedReason === reasonId;
                const label =
                  bookingPageContent.intentReasons[reasonId] ??
                  getBookingReasonLabel(reasonId);

                return (
                  <button
                    key={reasonId}
                    type="button"
                    onClick={() => {
                      setSelectedReason(reasonId);
                      if (reasonId !== "other") {
                        setReasonDetail("");
                      }
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-right transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <p className="font-medium text-heading">{label}</p>
                  </button>
                );
              })}
            </div>

            {selectedReason === "other" && (
              <Textarea
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder={bookingPageContent.intentOtherPlaceholder}
                rows={4}
                className="resize-none"
              />
            )}

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                {bookingPageContent.backLabel}
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="flex-1"
              >
                {bookingPageContent.nextLabel}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-heading text-2xl font-semibold text-heading mb-6">
              {bookingPageContent.paymentTitle}
            </h2>
            <Card className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-text">{service.title}</span>
                <span className="font-semibold text-heading">
                  {formatPrice(service.price)}
                </span>
              </div>
              <div className="text-sm text-text/70">
                {selectedDate &&
                  format(new Date(selectedDate), "EEEE d MMMM yyyy", {
                    locale: dateFnsLocale,
                  })}{" "}
                الساعة {selectedTime}
              </div>
              {selectedReason && (
                <div className="mt-3 pt-3 border-t border-border text-sm text-text/70">
                  <span className="text-text/60">
                    {bookingPageContent.steps.intent}:{" "}
                  </span>
                  <span className="text-heading">
                    {bookingPageContent.intentReasons[selectedReason] ??
                      getBookingReasonLabel(selectedReason)}
                    {selectedReason === "other" && reasonDetail.trim()
                      ? ` — ${reasonDetail.trim()}`
                      : ""}
                  </span>
                </div>
              )}
            </Card>

            {!isSignedIn ? (
              <Card className="mb-6 text-center py-6">
                <p className="text-text mb-4">
                  {bookingPageContent.signInPrompt}
                </p>
                <SignInButton mode="modal">
                  <Button>{bookingPageContent.signInButton}</Button>
                </SignInButton>
              </Card>
            ) : (
              <PaymentMethodSelector
                providers={providers}
                selected={selectedProvider}
                onSelect={(id) => setSelectedProvider(id as PaymentProviderId)}
                footnote={bookingPageContent.paymentFootnote}
              />
            )}

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(3)}>
                {bookingPageContent.backLabel}
              </Button>
              <Button
                onClick={handlePayment}
                disabled={paying || !isSignedIn}
                className="flex-1"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                    {bookingPageContent.payingLabel}
                  </>
                ) : (
                  bookingPageContent.payButton(payLabel)
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
