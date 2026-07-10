import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-border/55 motion-reduce:animate-none",
        className
      )}
      aria-hidden
      suppressHydrationWarning
      {...props}
    />
  );
}
