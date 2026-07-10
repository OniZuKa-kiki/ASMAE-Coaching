import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="section-padding" aria-busy aria-label="جارٍ التحميل">
      <div className="container-narrow space-y-8">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-56" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-28 rounded-[20px]" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-[20px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
