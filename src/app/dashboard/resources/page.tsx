import { Card } from "@/components/ui/card";
import { LibraryCatalog } from "@/components/dashboard/library-catalog";
import { libraryPageContent } from "@/lib/constants";
import { getDashboardResources } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

function getQueryValue(
  value: string | string[] | undefined,
  fallback = ""
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function DashboardResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedCourseId = getQueryValue(params.course).trim();
  const resources = await getDashboardResources();
  const filteredResources =
    !resources || !selectedCourseId
      ? resources ?? []
      : resources.filter((resource) => resource.courseId === selectedCourseId);

  const selectedCourseTitle =
    selectedCourseId && filteredResources.length > 0
      ? filteredResources[0].courseTitle
      : null;

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">مكتبتي</h1>
      {!resources || resources.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-text/70">{libraryPageContent.emptyLibrary}</p>
        </Card>
      ) : (
        <LibraryCatalog
          resources={filteredResources}
          selectedCourseId={selectedCourseId || undefined}
          selectedCourseTitle={selectedCourseTitle}
        />
      )}
    </div>
  );
}
