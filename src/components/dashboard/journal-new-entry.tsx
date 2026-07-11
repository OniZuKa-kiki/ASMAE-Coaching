"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { JournalMoodPicker } from "@/components/dashboard/journal-mood-picker";
import type { ActionResult } from "@/lib/action-result";

type JournalNewEntryProps = {
  action: (formData: FormData) => Promise<ActionResult>;
};

export function JournalNewEntry({ action }: JournalNewEntryProps) {
  const t = useTranslations("dashboard.journal");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover sm:w-auto"
      >
        <Plus className="h-5 w-5" />
        {t("newEntryButton")}
      </button>
    );
  }

  return (
    <Card className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl text-heading">{t("newEntryTitle")}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border p-2 text-text/70 transition-colors hover:border-primary/40 hover:text-primary"
          aria-label={t("close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ActionForm
        action={action}
        className="space-y-5"
        onSuccess={() => setOpen(false)}
      >
        <JournalMoodPicker />
        <AdminFormField label={t("contentLabel")} htmlFor="journal-content">
          <Textarea
            id="journal-content"
            name="content"
            rows={5}
            className="w-full resize-none"
            placeholder={t("contentPlaceholder")}
            required
            autoFocus
          />
        </AdminFormField>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            {t("saveEntry")}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
          >
            {tCommon("cancel")}
          </button>
        </div>
      </ActionForm>
    </Card>
  );
}
