"use server";

import { revalidatePath } from "next/cache";
import { incomplete, runAction, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/db";
import {
  isBookingReviewable,
  isValidSessionRating,
  parseSessionReviewComment,
} from "@/lib/session-review";
import { requireUser } from "@/lib/user";

export async function submitSessionReview(
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") || "").trim();
  const rating = Number(formData.get("rating"));
  const comment = parseSessionReviewComment(
    String(formData.get("comment") || "")
  );

  if (!bookingId || !isValidSessionRating(rating)) {
    return incomplete("ar");
  }

  return runAction("ar", async () => {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.id },
      include: { review: true },
    });

    if (!booking) {
      throw new Error("الجلسة غير موجودة.");
    }

    if (booking.review) {
      throw new Error("تم إرسال تقييمكِ مسبقًا لهذه الجلسة.");
    }

    if (!isBookingReviewable(booking)) {
      throw new Error("لا يمكن تقييم هذه الجلسة بعد.");
    }

    await prisma.bookingReview.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        rating,
        comment,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/bookings");
    revalidatePath("/dashboard/notifications");
    revalidatePath("/admin/bookings");
  }, "sent");
}
