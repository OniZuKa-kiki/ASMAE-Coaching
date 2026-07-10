"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover sm:w-auto"
      >
        <Plus className="h-5 w-5" />
        ملاحظة جديدة
      </button>
    );
  }

  return (
    <Card className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-xl text-heading">ملاحظة جديدة</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border p-2 text-text/70 transition-colors hover:border-primary/40 hover:text-primary"
          aria-label="إغلاق"
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
        <AdminFormField label="ماذا تودين مشاركته؟" htmlFor="journal-content">
          <Textarea
            id="journal-content"
            name="content"
            rows={5}
            className="w-full resize-none"
            placeholder="اكتبي بحرية ما يدور في ذهنكِ..."
            required
            autoFocus
          />
        </AdminFormField>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            حفظ الملاحظة
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
          >
            إلغاء
          </button>
        </div>
      </ActionForm>
    </Card>
  );
}
