import { adminUrl } from "@/lib/admin-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getUserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getMeetingMode() {
  const staticZoomUrl = process.env.ZOOM_STATIC_MEETING_URL?.trim();
  const staticMeetUrl = process.env.GOOGLE_MEET_STATIC_URL?.trim();
  const zoomAccountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const zoomClientId = process.env.ZOOM_CLIENT_ID?.trim();
  const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (staticZoomUrl) {
    return {
      title: "تم إعداد رابط Zoom ثابت",
      description:
        "سيستلم كل حجز مؤكد نفس رابط Zoom. هذه أبسط طريقة للبدء.",
      status: "نشط",
      provider: "Zoom (رابط ثابت)",
    };
  }

  if (staticMeetUrl) {
    return {
      title: "تم إعداد رابط Google Meet ثابت",
      description:
        "سيستلم كل حجز مؤكد نفس رابط Google Meet.",
      status: "نشط",
      provider: "Google Meet (رابط ثابت)",
    };
  }

  if (zoomAccountId && zoomClientId && zoomClientSecret) {
    return {
      title: "يمكن تفعيل إنشاء Zoom تلقائياً",
      description:
        "المشروع يحتوي على المتغيرات اللازمة لإنشاء رابط Zoom فريد لكل جلسة عبر Zoom API.",
      status: "مُعدّ",
      provider: "Zoom API",
    };
  }

  return {
    title: "لم يتم إعداد مكالمات الفيديو",
    description:
      "لم يتم إعداد أي رابط Zoom/Meet. سيستخدم النظام رابطاً احتياطياً إلى لوحة التحكم حتى يتم تحديد إعدادات مكالمات الفيديو.",
    status: "يحتاج إكمال",
    provider: "لا يوجد",
  };
}

export default async function AdminVisioSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const mode = getMeetingMode();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            مكالمات الفيديو
          </h1>
          <p className="text-sm text-text/70 mt-1">
            إدارة الروابط المُرسلة بعد تأكيد الحجز.
          </p>
        </div>
        <Link
          href={adminUrl("/settings")}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          رجوع
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">{mode.title}</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">الحالة:</span> {mode.status}
            </p>
            <p>
              <span className="font-semibold text-heading">الوضع الحالي:</span>{" "}
              {mode.provider}
            </p>
            <p>{mode.description}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">كيف يعمل</h2>
          <ul className="space-y-2 text-sm text-text/80 list-disc pl-5">
            <li>عند تأكيد دفع الحجز، ينتقل الحجز إلى حالة مؤكد.</li>
            <li>في هذه اللحظة، يُنشئ النظام أو يسترجع رابط مكالمة الفيديو.</li>
            <li>يُحفظ الرابط في الحجز ويُرسل في بريد العميل الإلكتروني.</li>
            <li>يجد العميل الرابط أيضاً في لوحته، قسم الاستشارات.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">نصيحة</h2>
          <p className="text-sm text-text/80">
            للبدء بسرعة، يكفي الرابط الثابت. لاحقاً، يمكنك الانتقال
            إلى رابط Zoom فريد لكل جلسة إذا فعّلت Zoom API بالكامل.
          </p>
        </Card>
      </div>
    </div>
  );
}
