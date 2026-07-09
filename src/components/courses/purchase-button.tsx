"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "@/components/payments/payment-method-selector";
import { formatPrice } from "@/lib/utils";
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

export function PurchaseCourseButton({
  slug,
  price,
}: {
  slug: string;
  price: number;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<PaymentProviderConfig[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProviderId>("payzone");

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

  const payAmount = convertCatalogAmountToProvider(price, selectedProvider);
  const payLabel = formatProviderAmount(
    payAmount.amountCents,
    payAmount.currency
  );

  async function handlePurchase() {
    if (!isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, provider: selectedProvider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      if (data.url) {
        notifySuccess(friendlyErrors.bookingRedirect);
        window.location.href = data.url;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "خطأ";
      setError(toFriendlyError(raw));
      notifyError(raw);
      setLoading(false);
    }
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="w-full">سجّل الدخول للشراء</Button>
      </SignInButton>
    );
  }

  return (
    <div>
      <PaymentMethodSelector
        providers={providers}
        selected={selectedProvider}
        onSelect={(id) => setSelectedProvider(id as PaymentProviderId)}
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <Button onClick={handlePurchase} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin me-2" />
            جاري التحويل...
          </>
        ) : (
          `شراء — ${payLabel}`
        )}
      </Button>
    </div>
  );
}
