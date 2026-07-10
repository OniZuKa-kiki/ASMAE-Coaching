"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingPickerProps = {
  name?: string;
  defaultValue?: number;
  required?: boolean;
  label?: string;
};

export function StarRatingPicker({
  name = "rating",
  defaultValue = 0,
  required = true,
  label = "التقييم",
}: StarRatingPickerProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [hover, setHover] = React.useState(0);

  const display = hover || value;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-heading">{label}</p>
      <input type="hidden" name={name} value={value || ""} required={required} />
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const star = index + 1;
          const active = star <= display;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setValue(star)}
            >
              <Star
                className={cn(
                  "h-7 w-7",
                  active
                    ? "fill-accent text-accent"
                    : "fill-transparent text-border"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
