import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SessionReviewForm } from "@/components/dashboard/session-review-form";
import { dashboardContent } from "@/lib/constants";
import type { ReviewableBooking } from "@/lib/session-review";

type SessionReviewPromptProps = {
  booking: ReviewableBooking;
};

export function SessionReviewPrompt({ booking }: SessionReviewPromptProps) {
  return (
    <Card className="mb-6 border-accent/30 bg-accent/5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Star className="h-5 w-5 fill-accent" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-heading">
            {dashboardContent.sessionReview.promptTitle}
          </h2>
          <p className="mt-1 text-sm text-text/70">
            {dashboardContent.sessionReview.promptSubtitle}
          </p>
        </div>
      </div>
      <SessionReviewForm
        bookingId={booking.id}
        serviceTitle={booking.service.title}
        sessionDate={booking.date}
        startTime={booking.startTime}
        compact
      />
    </Card>
  );
}
