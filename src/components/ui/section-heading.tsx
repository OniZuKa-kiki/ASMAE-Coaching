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
      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-heading mb-3 sm:mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-base sm:text-lg lg:text-[22px] font-medium text-text/80 max-w-2xl mx-auto px-2">
          {subtitle}
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <div className="h-px w-16 bg-accent" />
      </div>
    </div>
  );
}
