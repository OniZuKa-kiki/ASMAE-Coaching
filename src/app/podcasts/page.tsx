import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Lock, Headphones } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import {
  formatPodcastDuration,
  getPublishedPodcasts,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "البودكاست",
  description:
    "استمع إلى بودكاستاتي المجانية والمميزة حول التنمية الشخصية والرفاهية.",
};

export default async function PodcastsPage() {
  const podcasts = await getPublishedPodcasts();
  const freePodcasts = podcasts.filter((p) => !p.isPremium);
  const premiumPodcasts = podcasts.filter((p) => p.isPremium);

  return (
    <>
      <section className="section-padding bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-narrow text-center">
          <h1 className="page-title mb-6">
            البودكاست
          </h1>
          <p className="text-xl text-text/80 max-w-2xl mx-auto">
            محتوى صوتي لتغذية تفكيرك والتقدم وفق إيقاعك.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <SectionHeading title="بودكاست مجاني" subtitle="متاح للجميع" />
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {freePodcasts.map((podcast) => (
              <Link key={podcast.slug} href={`/podcasts/${podcast.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{podcast.title}</CardTitle>
                      <CardDescription>{podcast.description}</CardDescription>
                      <span className="flex items-center gap-1 text-sm text-text/60 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatPodcastDuration(podcast.duration)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <SectionHeading
            title="بودكاست مميز"
            subtitle="مخصص للأعضاء والعملاء"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {premiumPodcasts.map((podcast) => (
              <Link key={podcast.slug} href={`/podcasts/${podcast.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                      <Lock className="w-3 h-3" />
                      مميز
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{podcast.title}</CardTitle>
                      <CardDescription>{podcast.description}</CardDescription>
                      <span className="flex items-center gap-1 text-sm text-text/60 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatPodcastDuration(podcast.duration)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
