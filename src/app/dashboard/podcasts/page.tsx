import { Card } from "@/components/ui/card";
import { getDashboardPodcasts } from "@/lib/dashboard";
import { DashboardPodcastList } from "@/components/podcasts/dashboard-podcast-list";
import { ContinueListening } from "@/components/podcasts/continue-listening";
import {
  getContinueListeningPodcasts,
  getPodcastProgressMapForUser,
} from "@/lib/podcast-progress";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function DashboardPodcastsPage() {
  const user = await getOrCreateUser();
  const [data, continueListening, progressMap] = await Promise.all([
    getDashboardPodcasts(),
    getContinueListeningPodcasts(3),
    user ? getPodcastProgressMapForUser(user.id) : Promise.resolve(new Map()),
  ]);

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">البودكاست</h1>
      <ContinueListening items={continueListening} />
      {!data || data.podcasts.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">لا يوجد بودكاست متاح حالياً.</p>
        </Card>
      ) : (
        <DashboardPodcastList
          podcasts={data.podcasts.map((podcast) => {
            const progress = progressMap.get(podcast.id);
            return {
              id: podcast.id,
              slug: podcast.slug,
              title: podcast.title,
              description: podcast.description,
              duration: podcast.duration,
              isPremium: podcast.isPremium,
              positionSeconds: progress?.positionSeconds,
              durationSeconds: progress?.durationSeconds,
            };
          })}
          premiumUnlocked={data.premiumUnlocked}
          lockedMessage="يُفتح البودكاست الحصري بعد تأكيد جلستكِ الأولى أو شراء دورة تدريبية."
        />
      )}
    </div>
  );
}
