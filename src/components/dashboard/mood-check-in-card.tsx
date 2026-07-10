import { Card } from "@/components/ui/card";
import { MoodCheckInForm } from "@/components/dashboard/mood-check-in-form";
import { getUserTodayMoodCheckIn } from "@/lib/mood-check-in";

export async function MoodCheckInCard() {
  const today = await getUserTodayMoodCheckIn();

  return (
    <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
      <h2 className="font-heading text-lg font-semibold text-heading mb-1">
        كيف تشعرين اليوم؟
      </h2>
      <p className="text-sm text-text/70 mb-5">
        شاركي مزاجكِ باختصار — يساعد مدربتك على مرافقتكِ بشكل أفضل.
      </p>

      {today ? (
        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {today.emoji ? (
              <span className="text-2xl" aria-hidden>
                {today.emoji}
              </span>
            ) : null}
            <span className="font-semibold text-heading">{today.label}</span>
            <span className="text-xs text-text/60">· مسجّل اليوم</span>
          </div>
          {today.note ? (
            <p className="mt-2 text-sm text-text/80">{today.note}</p>
          ) : null}
          <p className="mt-3 text-xs text-text/60">
            يمكنكِ تحديث اختياركِ أدناه في أي وقت اليوم.
          </p>
          <div className="mt-4">
            <MoodCheckInForm
              defaultMood={today.mood}
              defaultNote={today.note ?? ""}
              submitLabel="تحديث"
            />
          </div>
        </div>
      ) : (
        <MoodCheckInForm submitLabel="حفظ" />
      )}
    </Card>
  );
}
