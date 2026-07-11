import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";

export default async function RootLoading() {
  const t = await getTranslations("common");

  return (
    <div className="section-padding" aria-busy aria-label={t("loadingAria")}>
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <Skeleton className="mx-auto h-10 w-2/3" />
          <Skeleton className="mx-auto h-5 w-full" />
          <Skeleton className="mx-auto h-5 w-5/6" />
          <div className="grid gap-4 pt-8 md:grid-cols-2">
            <Skeleton className="h-40 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
