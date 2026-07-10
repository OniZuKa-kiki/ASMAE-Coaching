"use client";

import { format } from "date-fns";
import { AdminFormField } from "@/components/admin/form-field";
import { StarRatingPicker } from "@/components/dashboard/star-rating-picker";
import { ActionForm } from "@/components/ui/action-form";
import { Textarea } from "@/components/ui/input";
import { dashboardContent } from "@/lib/constants";
import { dateFnsLocale } from "@/lib/locale";
import { submitSessionReview } from "@/lib/session-review-actions";

type SessionReviewFormProps = {
  bookingId: string;
  serviceTitle: string;
  sessionDate: Date;
  startTime: string;
  compact?: boolean;
};

export function SessionReviewForm({
  bookingId,
  serviceTitle,
  sessionDate,
  startTime,
  compact = false,
}: SessionReviewFormProps) {
  return (
    <ActionForm
      action={submitSessionReview}
      className={compact ? "space-y-3" : "space-y-4"}
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      {!compact ? (
        <div>
          <p className="font-semibold text-heading">{serviceTitle}</p>
          <p className="mt-1 text-sm text-text/70">
            {format(sessionDate, "EEEE d MMMM yyyy", { locale: dateFnsLocale })}{" "}
            في {startTime}
          </p>
        </div>
      ) : null}
      <StarRatingPicker label={dashboardContent.sessionReview.ratingLabel} />
      <AdminFormField
        label={dashboardContent.sessionReview.commentLabel}
        htmlFor={`review-comment-${bookingId}`}
      >
        <Textarea
          id={`review-comment-${bookingId}`}
          name="comment"
          rows={compact ? 2 : 3}
          maxLength={500}
          placeholder={dashboardContent.sessionReview.commentPlaceholder}
          className="w-full resize-none"
        />
      </AdminFormField>
      <button
        type="submit"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        {dashboardContent.sessionReview.submit}
      </button>
    </ActionForm>
  );
}
