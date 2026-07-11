import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  className,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(centered && "text-center", "mb-10 sm:mb-16", className)}>
      <h2 className="section-title mb-3 sm:mb-4">{title}</h2>
      {subtitle && (
        <p className="section-lead max-w-2xl mx-auto px-2">{subtitle}</p>
      )}
      <div className="mt-6 flex justify-center">
        <div className="h-px w-16 bg-accent" />
      </div>
    </div>
  );
}
