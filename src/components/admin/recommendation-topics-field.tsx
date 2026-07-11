import { AdminFormField } from "@/components/admin/form-field";
import { getAdminRecommendationTopicOptions } from "@/lib/admin-i18n";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

type RecommendationTopicsFieldProps = {
  selected?: string[];
  label: string;
  hint?: string;
};

export async function RecommendationTopicsField({
  selected = [],
  label,
  hint,
}: RecommendationTopicsFieldProps) {
  const locale = (await getLocale()) as AppLocale;
  const options = getAdminRecommendationTopicOptions(locale);
  const selectedSet = new Set(selected);

  return (
    <AdminFormField label={label} hint={hint}>
      <div className="flex flex-wrap gap-x-5 gap-y-3 rounded-2xl border border-border/60 bg-card/50 p-4">
        {options.map((option) => (
          <label
            key={option.id}
            className="inline-flex items-center gap-2 text-sm text-text"
          >
            <input
              type="checkbox"
              name="topics"
              value={option.id}
              defaultChecked={selectedSet.has(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </AdminFormField>
  );
}
