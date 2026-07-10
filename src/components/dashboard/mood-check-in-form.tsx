"use client";

import { AdminFormField } from "@/components/admin/form-field";
import { ActionForm } from "@/components/ui/action-form";
import { Textarea } from "@/components/ui/input";
import { JournalMoodPicker } from "@/components/dashboard/journal-mood-picker";
import { saveMoodCheckIn } from "@/lib/mood-check-in-actions";

type MoodCheckInFormProps = {
  defaultMood?: string | null;
  defaultNote?: string;
  submitLabel?: string;
};

export function MoodCheckInForm({
  defaultMood = null,
  defaultNote = "",
  submitLabel = "حفظ",
}: MoodCheckInFormProps) {
  return (
    <ActionForm action={saveMoodCheckIn} className="space-y-4">
      <JournalMoodPicker defaultValue={defaultMood} showLabel={false} />
      <AdminFormField label="ملاحظة قصيرة (اختياري)" htmlFor="mood-check-in-note">
        <Textarea
          id="mood-check-in-note"
          name="note"
          rows={2}
          maxLength={200}
          defaultValue={defaultNote}
          placeholder="أضيفي سطرًا إن أردتِ..."
          className="w-full resize-none"
        />
      </AdminFormField>
      <button
        type="submit"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
      >
        {submitLabel}
      </button>
    </ActionForm>
  );
}
