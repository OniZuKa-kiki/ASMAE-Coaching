"use client";

import { useEffect, useId, useState } from "react";
import { AdminFormField } from "@/components/admin/form-field";
import { Input } from "@/components/ui/input";
import {
  probeMediaDurationMinutes,
  type MediaDurationKind,
} from "@/lib/media-duration";

type MediaUrlFieldProps = {
  mediaType: MediaDurationKind;
  urlName: string;
  durationName: string;
  label: string;
  hint?: string;
  defaultUrl?: string;
  defaultDuration?: number | null;
  placeholder?: string;
  required?: boolean;
};

export function MediaUrlField({
  mediaType,
  urlName,
  durationName,
  label,
  hint,
  defaultUrl = "",
  defaultDuration = null,
  placeholder = "https://...",
  required = false,
}: MediaUrlFieldProps) {
  const inputId = useId();
  const [url, setUrl] = useState(defaultUrl);
  const [duration, setDuration] = useState<number | null>(defaultDuration);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    defaultDuration ? "ready" : "idle"
  );

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setDuration(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const timer = window.setTimeout(async () => {
      const minutes = await probeMediaDurationMinutes(trimmed, mediaType);
      if (cancelled) return;

      if (minutes) {
        setDuration(minutes);
        setStatus("ready");
      } else {
        setDuration(null);
        setStatus("error");
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mediaType, url]);

  const durationHint =
    status === "loading"
      ? "جاري كشف المدة تلقائياً..."
      : status === "ready" && duration
        ? `المدة المكتشفة: ${duration} دقيقة`
        : status === "error" && url.trim()
          ? "تعذّر كشف المدة. استخدم رابط ملف مباشر (.mp3, .m4a, .mp4)."
          : hint;

  return (
    <AdminFormField label={label} htmlFor={inputId} hint={durationHint}>
      <Input
        id={inputId}
        name={urlName}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder={placeholder}
        className="w-full"
        required={required}
      />
      <input type="hidden" name={durationName} value={duration ?? ""} />
    </AdminFormField>
  );
}
