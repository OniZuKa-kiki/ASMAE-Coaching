import { Card } from "@/components/ui/card";
import { adminFilterLabels, adminFilterSubmitClassName } from "@/lib/admin-filters";

type AdminFilterCardProps = {
  title: string;
  formClassName?: string;
  children: React.ReactNode;
};

export function AdminFilterCard({
  title,
  formClassName = "grid md:grid-cols-4 gap-4",
  children,
}: AdminFilterCardProps) {
  return (
    <Card className="mb-6">
      <h2 className="mb-4 font-heading text-xl text-heading">{title}</h2>
      <form method="GET" className={formClassName}>
        {children}
        <div className="flex items-end" suppressHydrationWarning>
          <button type="submit" className={adminFilterSubmitClassName}>
            {adminFilterLabels.submit}
          </button>
        </div>
      </form>
    </Card>
  );
}
