import { Skeleton } from "@/components/ui/skeleton";

export function SignInSkeleton() {
  return (
    <div
      className="flex min-h-[80vh] items-center justify-center section-padding bg-background"
      aria-busy
      aria-label="جارٍ التحميل"
    >
      <div className="w-full max-w-[420px] space-y-4 rounded-[20px] border border-border bg-card p-8 shadow-soft">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto h-4 w-56" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
