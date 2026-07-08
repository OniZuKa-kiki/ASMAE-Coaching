import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import { getDashboardPodcasts } from "@/lib/dashboard";
import { formatPodcastDuration } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DashboardPodcastsPage() {
  const data = await getDashboardPodcasts();

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        بودكاستاتي
      </h1>
      {!data || data.podcasts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-text/70">
            لا يوجد بودكاست متاح حالياً.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {!data.premiumUnlocked && (
            <Card className="bg-accent/10 border-accent/30">
              <p className="text-sm text-heading">
                يُفتح البودكاست المميز بعد تأكيد جلستك الأولى أو شراء دورة
                تدريبية.
              </p>
            </Card>
          )}
          {data.podcasts.map((podcast) => (
            <Card key={podcast.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-heading">{podcast.title}</p>
                  <p className="text-sm text-text/70 mt-1">{podcast.description}</p>
                  <p className="text-xs text-text/60 mt-2">
                    {formatPodcastDuration(podcast.duration)}
                  </p>
                </div>
                {podcast.isPremium && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    مميز
                  </span>
                )}
              </div>
              <Link
                href={`/podcasts/${podcast.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover mt-4"
              >
                <PlayCircle className="w-4 h-4" />
                فتح الحلقة
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
