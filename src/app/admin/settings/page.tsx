import { Card } from "@/components/ui/card";
import Link from "next/link";
import { adminUrl } from "@/lib/admin-path";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        الإعدادات
      </h1>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-heading mb-2">التوفر</h3>
          <p className="text-text/70 text-sm">
            اضبط فترات الاستشارة المتاحة.
          </p>
          <div className="mt-3">
            <Link
              href={adminUrl("/settings/availability")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إدارة
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">Zoom / Google Meet</h3>
          <p className="text-text/70 text-sm">
            تحقق من كيفية إنشاء روابط مكالمات الفيديو للحجوزات
            المؤكدة.
          </p>
          <div className="mt-3">
            <Link
              href={adminUrl("/settings/visio")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إدارة
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">استبيانات العملاء</h3>
          <p className="text-text/70 text-sm">
            اطلع على إجابات العملاء قبل الجلسات.
          </p>
          <div className="mt-3">
            <Link
              href={adminUrl("/settings/intake-forms")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إدارة
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">التواصل والبريد</h3>
          <p className="text-text/70 text-sm">
            عدّل البريد الإلكتروني، واتساب، إنستغرام وبريد استقبال الرسائل.
          </p>
          <div className="mt-3">
            <Link
              href={adminUrl("/settings/communication")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إدارة
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">البريد الإلكتروني</h3>
          <p className="text-text/70 text-sm">
            خصّص رسائل التأكيد والتذكير.
          </p>
          <div className="mt-3">
            <Link
              href={adminUrl("/settings/emails")}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              إدارة
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
