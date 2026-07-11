"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { journalMoods, type JournalMoodId } from "@/lib/journal-moods";
import { cn } from "@/lib/utils";

type JournalMoodPickerProps = {
  name?: string;
  defaultValue?: string | null;
  showLabel?: boolean;
};

export function JournalMoodPicker({
  name = "mood",
  defaultValue = null,
  showLabel = true,
}: JournalMoodPickerProps) {
  const t = useTranslations("dashboard.mood");
  const initial =
    defaultValue && journalMoods.some((m) => m.id === defaultValue)
      ? (defaultValue as JournalMoodId)
      : null;
  const [selected, setSelected] = useState<JournalMoodId | null>(initial);

  return (
    <div>
      <input type="hidden" name={name} value={selected ?? ""} />
      {showLabel ? (
        <p className="mb-3 text-sm font-medium text-heading">{t("pickerLabel")}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {journalMoods.map((mood) => {
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() =>
                setSelected((current) =>
                  current === mood.id ? null : mood.id
                )
              }
              className={cn(
                "flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30"
              )}
              aria-pressed={isSelected}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {mood.emoji}
              </span>
              <span className="text-xs font-medium text-heading">
                {t(`options.${mood.id}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
