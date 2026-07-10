import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({
  value,
  className,
  barClassName,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 w-full rounded-full bg-border", className)}>
      <div
        className={cn(
          "h-2 rounded-full bg-primary transition-all duration-300",
          clamped >= 100 && "bg-emerald-500",
          barClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
