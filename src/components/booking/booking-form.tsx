"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Clock, CreditCard, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { dateFnsLocale } from "@/lib/locale";
import { PaymentMethodSelector } from "@/components/payments/payment-method-selector";
import { getBookableDates } from "@/lib/booking-dates";
import { toFriendlyError } from "@/lib/api-errors";
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
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<PaymentProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProviderId>("payzone");

  const service = services.find((s) => s.slug === selectedService);

  const availableDates = getBookableDates(14);

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
    if (!selectedDate || !selectedTime || !service) return;

    if (!isSignedIn) {
      setError("سجّل الدخول لإتمام حجزك.");
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الدفع");

      if (data.url) window.location.href = data.url;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "خطأ في الدفع";
      setError(toFriendlyError(raw));
      setPaying(false);
    }
  }

  if (services.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-text/70">
          لا توجد خدمات متاحة حالياً. عد قريباً.
        </p>
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
    { num: 1, label: "الخدمة", icon: Calendar },
    { num: 2, label: "التاريخ والوقت", icon: Clock },
    { num: 3, label: "الدفع", icon: CreditCard },
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
            اختر خدمتك
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
            متابعة
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
            اختر التاريخ والوقت
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
                  لا توجد مواعيد متاحة في هذا اليوم.
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
              رجوع
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              متابعة
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
          >
          <h2 className="font-heading text-2xl font-semibold text-heading mb-6">
            دفع آمن
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
          </Card>

          {!isSignedIn ? (
            <Card className="mb-6 text-center py-6">
              <p className="text-text mb-4">
                سجّل الدخول لإتمام حجزك.
              </p>
              <SignInButton mode="modal">
                <Button>تسجيل الدخول</Button>
              </SignInButton>
            </Card>
          ) : (
            <PaymentMethodSelector
              providers={providers}
              selected={selectedProvider}
              onSelect={(id) => setSelectedProvider(id as PaymentProviderId)}
              footnote="سيُرسل إليك بريد تأكيد مع رابط الفيديو تلقائياً بعد الدفع."
            />
          )}

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setStep(2)}>
              رجوع
            </Button>
            <Button
              onClick={handlePayment}
              disabled={paying || !isSignedIn}
              className="flex-1"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                  جاري التحويل...
                </>
              ) : (
                `ادفع ${payLabel}`
              )}
            </Button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
