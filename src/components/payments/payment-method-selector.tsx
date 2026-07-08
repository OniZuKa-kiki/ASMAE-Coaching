"use client";

import { cn } from "@/lib/utils";
import type { PaymentProviderConfig } from "@/lib/payments/types";

export function PaymentMethodSelector({
  providers,
  selected,
  onSelect,
  footnote = "سيُرسل إليك بريد تأكيد تلقائياً بعد الدفع.",
}: {
  providers: PaymentProviderConfig[];
  selected: string;
  onSelect: (id: string) => void;
  footnote?: string;
}) {
  if (providers.length === 0) return null;

  if (providers.length === 1) {
    const provider = providers[0];
    return (
      <p className="text-sm text-text/60 mb-6">
        دفع آمن عبر {provider.label}. {footnote}
      </p>
    );
  }

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-heading mb-3">
        اختر وسيلة الدفع
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelect(provider.id)}
            className={cn(
              "w-full text-start p-4 rounded-xl border transition-all",
              selected === provider.id
                ? "border-primary bg-primary/10 ring-1 ring-primary"
                : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>
                {provider.flag}
              </span>
              <div>
                <p className="font-medium text-heading">{provider.label}</p>
                <p className="text-sm text-text/70">{provider.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <p className="text-sm text-text/60 mt-4">{footnote}</p>
    </div>
  );
}
